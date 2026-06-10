import express from 'express';
import cors from 'cors';
import imageRoutes from './routes/image.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// All image API routes under /api
app.use('/api', imageRoutes);

// Must be registered after routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
