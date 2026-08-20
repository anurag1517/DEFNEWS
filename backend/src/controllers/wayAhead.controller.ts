import { Request, Response, NextFunction } from 'express';
import { generateWayAheadAnalysis } from '../services/wayAhead.service';

export async function getWayAheadAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
        const { title, description, category, source, customQuery } = req.body;

        if (!title && !description && !customQuery) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: title, description, or customQuery.'
            });
        }

        const analysis = generateWayAheadAnalysis({
            title: title || customQuery || 'Submitted Event',
            description: description || title || customQuery || '',
            category,
            source,
            customQuery
        });

        return res.json({
            success: true,
            analysis
        });
    } catch (error) {
        console.error('[API ERROR] Failed in getWayAheadAnalysis controller:', error);
        next(error);
    }
}
