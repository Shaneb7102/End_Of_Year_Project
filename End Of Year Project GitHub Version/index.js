const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true })); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to receive messages from frontend and send to ChatGPT
app.post('/sendMessage', async (req, res) => {
    try {
        const userMessage = req.body.messages;
        
        console.log(userMessage); // Log the received message
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo", // Use an appropriate model
            messages: userMessage,
        }, {
            headers: {
                'Authorization': `Bearer YOUR_API_KEY` // Replace YOUR_API_KEY with your actual API key
            }
        });

        // Send ChatGPT's response back to the frontend
        res.json({ message: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        res.status(500).send('Error processing your request');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
