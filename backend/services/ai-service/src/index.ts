import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { config } from './config';
import aiRoutes from './routes/ai.routes';

const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.use(cors({ origin: false }));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/ai', aiRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`✓ ai-service listening on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    console.error('[ai-service] Startup failed:', error);
    process.exit(1);
  }
}

start();
