const express = require('express');
const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const router = express.Router();

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);

router.post('/events', slackEvents.requestListener());

slackEvents.on('app_mention', async (event) => {
    try {
        const { text, channel, user } = event;
        
        // Parse the ticket request from the message
        const ticketRequest = text.replace(/<@\w+>\s*/, '').trim();
        
        // Create ticket
        const ticket = await webClient.chat.postMessage({
            channel,
            text: `Creating ticket for: ${ticketRequest}`
        });
        
        // TODO: Integrate with your ticket creation API
        
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
