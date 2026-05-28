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

// Custom Cookie Parser Middleware (Không dùng thư viện ngoài)
app.use((req: any, res: any, next: any) => {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      let [name, ...rest] = cookie.split('=');
      name = name.trim();
      if (!name) return;
      const val = rest.join('=').trim();
      if (!val) return;
      list[name] = decodeURIComponent(val);
    });
  }
  req.cookies = list;
  next();
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Backend is running smoothly' });
});

// API Routes
app.use('/api/v1', routes);

// Error Handling
app.use(errorMiddleware);

export default app;
