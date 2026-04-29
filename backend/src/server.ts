import express from 'express';
import { PORT } from './constants/index.js';
import healthRouter from './routes/health.js';
import { connectDB } from './db/database.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => res.json({ service: 'testmail-wrapper', status: 'starting' }));
app.use('/health', healthRouter);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

export default app;
