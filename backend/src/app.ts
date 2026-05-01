import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './core/middleware/error.middleware';

const app: Application = express();

// Middleware
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Backend is running smoothly' });
});

// API Routes
app.use('/api/v1', routes);

// Error Handling
app.use(errorMiddleware);

export default app;
