import { Request, Response } from 'express';
import { streamZip } from '../services/download.service';

export const downloadController = {
  downloadZip(_req: Request, res: Response): void {
    streamZip(res);
  },
};
