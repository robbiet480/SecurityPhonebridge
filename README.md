# SecurityPhonebridge
A Lambda function to programmatically handle phone calls from my apartment building security.

It accepts calls from Twilio via the AWS API Gateway, builds a TwiML response, and sends a payload about the call via SNS.

I use it so that when the front desk/security at my apartment building calls me to tell me I have a package, someone is here to see me, or deliver something, I can receive notifications how I want and take action.

As an example, when I have someone arrive to see me, when security calls and presses 2 the call forwards to my cell phone and alerts my home automation system to turn entryway lights on.

I have another Lambda function that is run when a new message is put into SNS which processes the payload and alerts my home automation system.

## Usage
1. Copy `config.example.js` to `config.js`.
2. Change the config as needed. All values are required except values in `say`.
3. Run `grunt deploy`.
4. Configure AWS API Gateway to accept POST requests to your Lambda function.
5. In the Method Execution step of your API Gateway resource, add a Body Mapping Template for `application/x-www-form-urlencoded`. The contents should only be `{"body" : $input.json('$')}`.
6. Point a Twilio phone number to your API Gateway URL.
7. ...
8. Profit

## Phone tree

### Initial call
Ask the caller to provide input.

### Press 1

Alerts me of a package and hangs up the call.

### Press 2

Forwards the call to my cell phone, because someone is here to see me/deliver something/misc. reasons.

## Testing
`grunt test`. Change event.json to test different scenarios.

## Contributing
Fork, change, submit PR, done.

## License
MIT
