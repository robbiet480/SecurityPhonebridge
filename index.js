var qs = require('querystring')
  , AWS = require('aws-sdk')
  , sns = new AWS.SNS();

exports.handler = function (event, context, callback) {
  var xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
  var event_type;
  var number_of_ready_packages = 0;
  var call_answer_status = "accepted";
  var test_mode = (context.awsRequestId === 'LAMBDA_INVOKE');
  var config = test_mode ? require('./config.example') : require('./config');

  var body = qs.parse(event.body);
  var queryParams = event.queryParams;
  var matched = {};
  if(!config.numbers[body.To]) {
    console.error('A call was just received for a number ('+body.To+') that is not in the config!');
    console.error('The call was rejected. Please check your configuration!');
    event_type = 'unknown_number';
    xml += '<Reject reason="rejected" />';
    call_answer_status = "rejected";
    matched.name = 'Unknown';
  } else {
    matched = config.numbers[body.To];
  }
  if (config.incoming_whitelist.indexOf(body.From) === -1) {
    event_type = 'number_not_on_whitelist';
    xml += '<Reject reason="'+config.whitelist_reject_reason+'" />';
    call_answer_status = "rejected";
  } else if (body.Digits && queryParams.gather_reason === "package_query") {
    number_of_ready_packages = body.Digits;
    console.log('Alerted that there are', number_of_ready_packages, 'packages available for', matched.name+'.');
    event_type = 'package_ready';
    xml += buildSayTag(config.say_text.package_ready, matched.say);
  } else if (body.Digits && queryParams.gather_reason === "menu") {
    switch (body.Digits) {
      case '1':
        event_type = 'package_input';
        xml += '<Gather timeout="3" numDigits="2" action="'+config.route_url+'?gather_reason=package_query">';
        xml += buildSayTag(config.say_text.package_query, matched.say);
        xml += '</Gather>';
        break;
      case '2':
        event_type = 'delivery_access_request';
        xml += '<Dial callerId="'+body.To+'">'+matched.forward_to+'</Dial>';
        break;
      default:
        event_type = 'invalid_gather_input';
        xml += buildSayTag(config.say_text.gather_input_invalid, matched.say);
    }
  } else if (event_type != 'unknown_number') {
    event_type = 'call_received';
    xml += '<Gather timeout="3" numDigits="1" action="'+config.route_url+'?gather_reason=menu">';
    xml += buildSayTag(config.say_text.gather, matched.say);
    xml += '</Gather>';
    xml += buildSayTag(config.say_text.gather_no_input, matched.say);
  }

  xml += '</Response>';

  var payload = {'human': matched.name, 'body': body, 'event_type': event_type, 'call_answer_status': call_answer_status};
  if(event_type === 'package_ready') {
    payload.number_of_ready_packages = number_of_ready_packages;
  }
  var snsPayload = JSON.stringify(payload);

  if(test_mode) {
    return callback(null, 'TwiML Response: '+xml+'\n\nWould send this payload to SNS:\n'+JSON.stringify(payload, null, 2));
  } else {
    sns.publish({
      Message: JSON.stringify({default: snsPayload}),
      MessageStructure: 'json',
      TargetArn: config.sns_topic
    }, function(err, data) {
      if (err) {
        console.error('SNS error!', err.message);
      } else if(test_mode) {
        console.log('SNS data', data);
      }
      return callback(null, xml);
    });
  }
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
