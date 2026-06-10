
import type { Request, Response } from 'express';

import { optimizeAll } from '../services/optimize.service.js';

export const optimizeController = {
  async optimizeAll(req: Request, res: Response): Promise<void> {
    try {
      const quality = req.query.quality ? parseInt(req.query.quality as string, 10) : 80;

      if (isNaN(quality) || quality < 1 || quality > 100) {
        res.status(400).json({ error: 'quality must be a number between 1 and 100.' });
        return;
      }

      const results = await optimizeAll(quality);

      if (results.length === 0) {
        res.status(404).json({ error: 'No images found to optimize.' });
        return;
      }

      const totalSaved = results.reduce((sum, r) => sum + r.savedBytes, 0);

      res.status(200).json({
        message: `${results.length} image(s) optimized.`,
        totalSavedBytes: totalSaved,
        results,
      });
    } catch (err) {
      console.error('Optimize error:', err);
      res.status(500).json({ error: 'Failed to optimize images.' });
    }
  },
};
