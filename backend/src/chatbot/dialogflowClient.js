const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');

const keyFilePath = path.join(__dirname, 'dialogflow-key.json'); // Adjust if file is renamed
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: keyFilePath
});

const projectId = JSON.parse(require('fs').readFileSync(keyFilePath)).project_id;

async function detectIntentFromDialogflow(message, sessionId) {
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  return result.fulfillmentText || "Sorry, I couldn't find an answer.";
}

module.exports = detectIntentFromDialogflow;