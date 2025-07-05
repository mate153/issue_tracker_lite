const express = require('express');
const router = express.Router();
const titleGeneratorService = require('../Services/titleGeneratorService');
const logger = require('../Utils/logger');

// Title Generate
router.post('/generate_title', async (req, res) => {
    try {
        const { description } = req.body;
        if (!description?.trim()) {
            return res.status(400).json({ error: 'Description is required.' });
        }
        const title = await titleGeneratorService.generateTitle(description);
        res.json({ title });
    } catch (err) {
        logger.error('[TITLE] Generation failed:', err);
        res.status(500).json({ error: err.message || 'Could not generate title.' });
    }
});

module.exports = () => router;