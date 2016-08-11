var config = require('./config')
  , qs = require('querystring')
  , AWS = require('aws-sdk')
  , sns = new AWS.SNS();

exports.handler = function (event, context, callback) {
    var params = qs.parse(event.body);
    var matched = config.numbers[params.To];
    var xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    var event_type;
    if (config.incoming_whitelist.indexOf(params.From) === -1) {
      event_type = 'number_not_on_whitelist';
      xml += '<Reject reason="busy" />';
    } else if (params.Digits) {
      switch (params.Digits) {
        case '1':
          event_type = 'package_ready';
          xml += buildSayTag(config.say_text.package_ready, matched.say);
          break;
        case '2':
          event_type = 'delivery_access_request';
          xml += '<Dial callerId="'+params.To+'">'+matched.forward_to+'</Dial>';
          break;
        default:
          event_type = 'invalid_gather_input';
          xml += buildSayTag(config.say_text.gather_input_invalid, matched.say);
      }
    } else {
      event_type = 'call_received';
      xml += '<Gather numDigits="1">';
      xml += buildSayTag(config.say_text.gather, matched.say);
      xml += '</Gather>';
      xml += buildSayTag(config.say_text.gather_no_input, matched.say);
    }

    var snsPayload = JSON.stringify({'human': matched.name, 'matched': matched, 'params': params, 'event_type': event_type});

    sns.publish({
      Message: JSON.stringify({default: snsPayload}),
      MessageStructure: 'json',
      TargetArn: config.sns_topic
    }, function(err, data) {
      if (err) {
        console.error('SNS error!', err.message);
      } else {
        console.log('SNS data', data);
      }
      xml += '</Response>';
      callback(null, xml);
    });
};

function esc(str) {
  return String(str).replace(/&/g, '&amp;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildSayTag(text, config){
  var attributes = [];
  for (var attr in config) {
    attributes.push(' ' + attr + '="' + esc(config[attr]) + '"');
  }
  return '<Say'+attributes.join('')+'>'+esc(text)+'</Say>'
}
