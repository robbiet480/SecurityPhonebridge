module.exports = {
  incoming_whitelist: ["+15101234567"],
  lambda_arn: "arn:aws:lambda:us-west-2:012345678910:function:securityphonebridge",
  numbers: {
    "+19251234567": {
      "forward_to": "+15101234567",
      "name": "Robbie",
      "say": {
        "voice": "man",
        "language": "en-US"
      }
    }
  },
  route_url: "/twiml",
  say_text: {
    gather: "Press one for package delivery or two for anything else.",
    gather_input_invalid: "The option you selected is invalid. Goodbye!",
    gather_no_input: "We didn't receive any input. Goodbye!",
    package_query: "Please enter the number of packages ready for pickup.",
    package_ready: "Thank you."
  },
  sns_topic: "arn:aws:sns:us-west-2:012345678910:securityphonebridge",
  whitelist_reject_reason: "rejected",
}
