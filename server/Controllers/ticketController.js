const express = require('express');
const router = express.Router();
const ticketService = require('../Services/ticketService');
const logger = require('../Utils/logger');

// Create ticket
router.post('/add_ticket', async (req, res) => {
    try {
        if (!req.body.userId) {
            logger.error('[TICKET] Unauthorized ticket creation attempt');
            return res.status(401).json({ error: 'Unauthorized: user not authenticated' });
        }

        const userId = req.body.userId;
        const { title, description, status, priority, category } = req.body;

        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: 'Bad Request: title is required' });
        }

        const ticket = await ticketService.createTicket(
            { title, description, status, priority, category },
            userId
        );
        logger.info(`[TICKET] Created ticket #${ticket.id} for user ${userId}`);
        return res.status(201).json(ticket);

    } catch (err) {
        logger.error('[TICKET] Creation failed:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get tickets
router.post('/get_tickets', async (req, res) => {
    try {
        if (!req.body.userId) {
            logger.error('[TICKET] Unauthorized fetch attempt');
            return res.status(401).json({ error: 'Unauthorized: user not authenticated' });
        }

        const userId = req.body.userId;
        const tickets = await ticketService.getAllTickets();
        return res.status(200).json(tickets);

    } catch (err) {
        logger.error('[TICKET] Fetch failed:', err);
        return res.status(500).json({ error: 'Internal Server Error: could not fetch tickets' });
    }
});

// Delete ticket
router.delete('/delete_ticket', async (req, res) => {
    try {
        if (!req.body.userId) {
            logger.error('[TICKET] Unauthorized delete attempt');
            return res.status(401).json({ error: 'Unauthorized: user not authenticated' });
        }

        const userId = req.body.userId;
        const id = req.body.ticketId;

        if (!id) {
            return res.status(400).json({ error: 'Bad Request: ticket id is required.' });
        }

        await ticketService.deleteTicket(id, userId);
        logger.info(`[TICKET] Deleted ticket #${id} for user ${userId}`);
        return res.status(200).json({ success: true, message: 'Ticket deleted.' });

    } catch (err) {
        logger.error('[TICKET] Deletion failed:', err);
        return res.status(500).json({ error: 'Internal Server Error: could not delete ticket.' });
    }
});

// Edit ticket
router.put('/edit_ticket', async (req, res) => {
    try {
        if (!req.body.userId) {
            logger.error('[TICKET] Unauthorized update attempt');
            return res.status(401).json({ error: 'Unauthorized: user not authenticated' });
        }
        const userId = req.body.userId;

        const { id, title, description, status, priority, category } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Bad Request: ticket id is required.' });
        }
        if (!title?.trim()) {
            return res.status(400).json({ error: 'Bad Request: title is required.' });
        }
        if (!description?.trim()) {
            return res.status(400).json({ error: 'Bad Request: description is required.' });
        }
        if (!status) {
            return res.status(400).json({ error: 'Bad Request: status is required.' });
        }

        const updated = await ticketService.editTicket(
            id,
            userId,
            {
                title: title.trim(),
                description: description.trim(),
                status,
                priority: priority || null,
                category: category || null

            }
        );

        logger.info(`[TICKET] Updated ticket #${id} for user ${userId}`);
        return res.status(200).json({ success: true, ticket: updated });

    } catch (err) {
        logger.error('[TICKET] Update failed:', err);

        const statusCode = err.statusCode && typeof err.statusCode === 'number'
        ? err.statusCode
        : 500;

        const message = statusCode === 500
        ? 'Internal Server Error: could not update ticket.'
        : err.message;

        return res.status(statusCode).json({ error: message });
    }
});

// Add comment to ticket 
router.post('/comments/add_comment', async (req, res) => {
    try {
        if (!req.body.userId) {
            logger.error('[COMMENTS] Unauthorized add-comment attempt');
            return res.status(401).json({ error: 'Unauthorized: user not authenticated' });
        }
        const userId = req.body.userId;

        const { ticketId, text } = req.body;
        if (!ticketId) {
            return res.status(400).json({ error: 'Bad Request: ticketId is required.' });
        }
        if (!text?.trim()) {
            return res.status(400).json({ error: 'Bad Request: comment text is required.' });
        }

        const comment = await ticketService.addCommentToTicket(
            ticketId,
            userId,
            text.trim()
        );
        logger.info(`[COMMENTS] User ${userId} added comment #${comment.id} to ticket #${ticketId}`);
        return res.status(201).json(comment);

    } catch (err) {
        logger.error('[COMMENTS] Add failed:', err);

        const statusCode = (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600)
        ? err.statusCode
        : 500;

        const message = statusCode === 500
        ? 'Internal Server Error: could not add comment.'
        : err.message;

        return res.status(statusCode).json({ error: message });
    }
});

module.exports = () => router;
