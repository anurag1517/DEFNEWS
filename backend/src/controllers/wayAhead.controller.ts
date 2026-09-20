import { Request, Response, NextFunction } from 'express';
import { handleWayAheadChat } from '../services/wayAhead.service';

export async function getWayAheadAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
        const { title, description, category, source, customQuery, messages } = req.body;

        if (!title && !description && !customQuery && (!messages || messages.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: title, description, customQuery, or messages.'
            });
        }

        let conversationHistory = Array.isArray(messages) ? [...messages] : [];

        // If no conversation messages passed, construct initial user query
        if (conversationHistory.length === 0) {
            const promptText = customQuery || 'What is the Way Ahead and strategic roadmap for this news story?';
            conversationHistory = [{ role: 'user', content: promptText }];
        }

        const result = await handleWayAheadChat({
            title: title || customQuery || 'Submitted Story',
            description: description || title || customQuery || '',
            category,
            source,
            messages: conversationHistory
        });

        return res.json(result);
    } catch (error) {
        console.error('[API ERROR] Failed in getWayAheadAnalysis controller:', error);
        next(error);
    }
}
