const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// POST /api/chatbot/
router.post('/', async (req, res) => {
    const { query, language } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const pythonPath = path.join(__dirname, '..', 'python', 'chatbot_service.py');
    const process = spawn('python', [pythonPath, JSON.stringify({ query, language })]);

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => output += data.toString());
    process.stderr.on('data', (data) => error += data.toString());

    process.on('close', (code) => {
        if (code !== 0 || error) return res.status(500).json({ error: error.toString() });
        try { res.json({ answer: JSON.parse(output) }); }
        catch { res.status(500).json({ error: 'Invalid JSON from Python' }); }
    });
});

// GET /api/chatbot/suggested
router.get('/suggested', (req, res) => {
    res.json([
        "How do I submit my life certificate?",
        "Why is my pension payment delayed?",
        "How do I update my bank details?",
        "How can I track my grievance status?",
        "What documents are required for pension grievance?"
    ]);
});

// GET /api/chatbot/languages
router.get('/languages', (req, res) => {
    res.json({ en: "English", hi: "Hindi", mr: "Marathi" });
});


router.get('/suggested', async (req, res) => {
    try {
        const questions = await chatbot.getSuggestedQuestions();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get suggested questions' });
    }
});

module.exports = router; 