import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT, FRONTEND_URL } from './constants/index.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.routes.js';
import configRouter from './routes/config.routes.js';
import { connectDB } from './db/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { startTestmailSyncWorker } from './services/testmail-sync.service.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL || true,
    credentials: true,
  })
);

app.get('/', (_req, res) => res.json({ service: 'testmail-wrapper', status: 'starting' }));
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/config', configRouter);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  await startTestmailSyncWorker();
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

export default app;
