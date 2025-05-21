require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const axios = require('axios'); // Needed for custom NLP call

const app = express();
app.use(cors());
app.use(bodyParser.json());

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = uuid.v4();

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

app.post('/webhook', async (req, res) => {
  const userMessage = req.body.message;

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userMessage,
        languageCode: 'en-US',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;

  if (result.intent.displayName === 'Default Fallback Intent') {
    // Forward to custom NLP if Dialogflow doesn't understand
    const nlpResponse = await axios.post('http://localhost:5006/custom-nlp', {
      message: userMessage,
      userId: req.body.userId,
    });
    return res.send({ reply: nlpResponse.data.reply });
  }

  res.send({ reply: result.fulfillmentText });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Chatbot webhook server running on port ${PORT}`);
});