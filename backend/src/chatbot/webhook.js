
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Environment variables validation
const requiredEnvVars = ['DIALOGFLOW_PROJECT_ID', 'GOOGLE_APPLICATION_CREDENTIALS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const customNlpUrl = process.env.CUSTOM_NLP_URL || 'http://localhost:5006/custom-nlp';

// Initialize Dialogflow client
let sessionClient;
try {
    sessionClient = new dialogflow.SessionsClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    console.log('✅ Dialogflow client initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Dialogflow client:', error);
    process.exit(1);
}

// Store session IDs per user
const userSessions = new Map();

function getUserSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, uuidv4());
    }
    return userSessions.get(userId);
}

app.post('/webhook', async (req, res) => {
    try {
        const { message, userId } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ 
                error: 'Message is required',
                reply: 'Please provide a message to process.' 
            });
        }

        const userMessage = message.trim();
        const sessionId = getUserSession(userId || 'anonymous');
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

        console.log(`Processing message: "${userMessage}" for user: ${userId || 'anonymous'}`);

        // Try Dialogflow first
        const dialogflowRequest = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: userMessage,
                    languageCode: 'en-US',
                },
            },
        };

        const dialogflowResponses = await sessionClient.detectIntent(dialogflowRequest);
        const dialogflowResult = dialogflowResponses[0].queryResult;

        console.log(`Dialogflow intent: ${dialogflowResult.intent.displayName}`);
        console.log(`Dialogflow confidence: ${dialogflowResult.intentDetectionConfidence}`);

        // If Dialogflow has low confidence or fallback intent, use custom NLP
        const isLowConfidence = dialogflowResult.intentDetectionConfidence < 0.6;
        const isFallbackIntent = dialogflowResult.intent.displayName === 'Default Fallback Intent';

        if (isLowConfidence || isFallbackIntent) {
            console.log('Routing to custom NLP...');
            
            try {
                const nlpResponse = await axios.post(customNlpUrl, {
                    message: userMessage,
                    userId: userId || 'anonymous',
                }, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (nlpResponse.data && nlpResponse.data.reply) {
                    return res.json({ 
                        reply: nlpResponse.data.reply,
                        source: 'custom-nlp'
                    });
                } else {
                    throw new Error('Invalid response from custom NLP service');
                }
            } catch (nlpError) {
                console.error('Custom NLP error:', nlpError.message);
                
                // Fallback to Dialogflow response even if confidence is low
                const fallbackReply = dialogflowResult.fulfillmentText || 
                    "I'm sorry, I'm having trouble understanding your request. Could you please rephrase it?";
                
                return res.json({ 
                    reply: fallbackReply,
                    source: 'dialogflow-fallback'
                });
            }
        } else {
            // Use Dialogflow response for high confidence
            return res.json({ 
                reply: dialogflowResult.fulfillmentText,
                source: 'dialogflow'
            });
        }

    } catch (error) {
        console.error('Webhook error:', error);
        
        return res.status(500).json({ 
            error: 'Internal server error',
            reply: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'chatbot-webhook',
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`🚀 Chatbot webhook server running on port ${PORT}`);
    console.log(`📡 Custom NLP URL: ${customNlpUrl}`);
});