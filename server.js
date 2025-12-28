const express = require('express');
const Twilio = require('twilio');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: false })); // Needed to read Twilio POST data
app.use(express.static(path.join(__dirname, 'public'))); // Serves index.html and twilio.min.js

// YOUR CREDENTIALS
const accountSid = 'ACb763601e2061a46e200c74ae52048c26'; 
const authToken = '0a6adbb5652f5d6df634f4ac639faf36';
const apiKey = 'SK76df25fa2739c80e2df3eb03c1dec469';
const apiSecret = 'vqn1kighAsIaOY6k1T3WXzC5WhjtIEfO';
const outgoingApplicationSid = 'AP60f15451a0f368574a542fa1803f44c9'; // Your TwiML App SID
const twilioNumber = '+17744802708'; // Your Twilio Number

// 1. ROUTE: GET TOKEN
app.get('/token', (req, res) => {
    const accessToken = new Twilio.jwt.AccessToken(accountSid, apiKey, apiSecret, { identity: 'user' });
    const grant = new Twilio.jwt.AccessToken.VoiceGrant({
        outgoingApplicationSid: outgoingApplicationSid,
        incomingAllow: true,
    });
    accessToken.addGrant(grant);
    res.json({ token: accessToken.toJwt() });
});

// 2. ROUTE: VOICE WEBHOOK (This makes the phone ring!)
app.post('/voice', (req, res) => {
    const response = new Twilio.twiml.VoiceResponse();
    
    // The 'To' parameter comes from: device.connect({ params: { To: num } })
    const toNumber = req.body.To;

    if (toNumber) {
        const dial = response.dial({ callerId: twilioNumber });
        dial.number(toNumber);
        console.log(`[Twilio] Dialing mobile: ${toNumber}`);
    } else {
        response.say("No phone number provided.");
    }

    res.type('text/xml');
    res.send(response.toString());
});

app.listen(3000, () => console.log('Server running on port 3000'));