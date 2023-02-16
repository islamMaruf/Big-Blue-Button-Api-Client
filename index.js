const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config()
const apiClient = require('./ApiClient')
const fs = require('fs');
const path = require('path')

app.use(morgan('dev'))
app.use(morgan('dev', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

}));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

const PORT = process.env.PORT

app.get('/', (req, res) => {
    res.json({greetings: 'Hello world'});
});

app.post('/webhook', (req, res) => {
    const {event} = req.body;
    fs.appendFile("output.json", JSON.stringify(event), 'utf8', function (err) {
        if (err) {
            console.log("An error occurred while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });

    switch (event) {
        case 'meeting-created':
            console.log(`Meeting created: ${JSON.stringify(payload)}`);
            break;
        case 'meeting-ended':
            console.log(`Meeting ended: ${JSON.stringify(payload)}`);
            break;
        case 'user-joined':
            console.log(`User joined the meeting: ${JSON.stringify(payload)}`);
            break;
        case 'user_left':
            console.log(`User left the meeting: ${JSON.stringify(payload)}`);
            break;
        case 'participant_joined_voice':
            console.log(`Participant joined voice: ${JSON.stringify(payload)}`);
            break;
        case 'participant_left_voice':
            console.log(`Participant left voice: ${JSON.stringify(payload)}`);
            break;
        case 'participant_sharing_video':
            console.log(`Participant sharing video: ${JSON.stringify(payload)}`);
            break;
        case 'participant_stopped_sharing_video':
            console.log(`Participant stopped sharing video: ${JSON.stringify(payload)}`);
            break;
        case 'participant_raised_hand':
            console.log(`Participant raised hand: ${JSON.stringify(payload)}`);
            break;
        case 'participant_lowered_hand':
            console.log(`Participant lowered hand: ${JSON.stringify(payload)}`);
            break;
        default:
            console.log(`Unknown event received: ${event}`);
    }

    res.sendStatus(200);
});

app.post('/create-meeting', async (req, res) => {
    const data = req.body
    const response = await apiClient.createMeeting(data)
    res.json(response)
});

app.post('/join-meeting', async (req, res) => {
    const data = req.body;
    const response = await apiClient.joinMeeting(data)
    res.json(response)

})

app.get('/meetings', async (req, res) => {
    const response = await apiClient.getMeetings()
    res.json(response)
})


app.get('/meeting/:meetingId', async (req, res) => {
    const meetingId = req.params.meetingId
    const response = await apiClient.getMeetingInfo({
        meetingID: meetingId
    })
    res.json(response)
})

app.post('/end-meeting', async (req, res) => {
    const response = await apiClient.endMeeting(req.body)
    res.json(response)
})

app.get('/webhooks', async (req, res) => {
    const response = await apiClient.getWebhooks()
    res.json(response)
})

app.post('/create-webhook', async (req, res) => {
    const data = req.body;
    console.log(data)
    const response = await apiClient.createWebhook(data)
    res.json(response)
})

app.post('/delete-webhook', async (req, res) => {
    const data = req.body;
    const response = await apiClient.destroyHooks(data)
    res.json(response)
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
