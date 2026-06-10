
import type { Request, Response } from 'express';

import { clearAll } from '../services/delete.service.js';

export const deleteController = {
  deleteAll(_req: Request, res: Response): void {
    const result = clearAll();

    if (result.errors.length > 0) {
      console.warn('Delete errors:', result.errors);
    }

    res.status(200).json({
      message: `${result.deleted} file(s) deleted.`,
      errors: result.errors,
    });
  },
};
