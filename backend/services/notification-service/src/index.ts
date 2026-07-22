import path from 'path'
import dotenv from 'dotenv'

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './config'
import { connectDB } from './config/db'
import { initializeEventBus } from './services/eventBus.integration'
import notificationRoutes from './routes/notification.routes'
import messagingRoutes from './routes/messaging.routes'
import broadcastRoutes from './routes/broadcast.routes'

const app = express()

// Security & parsing
app.use(helmet())
app.disable('x-powered-by')
app.use(cors({ origin: false }))
app.use(morgan(config.isProduction ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/messages', messagingRoutes)
app.use('/api/v1/broadcasts', broadcastRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[notification-service error]', err.message)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.isProduction ? {} : { stack: err.stack }),
  })
})

async function start() {
  await connectDB()

  // Initialize event bus
  try {
    await initializeEventBus()
  } catch (error: any) {
    console.warn(
      '[notification-service] Event bus initialization failed (non-critical):',
      error.message
    )
    // Continue anyway - service still works without event bus
  }

  app.listen(config.port, () => {
    console.log(`[notification-service] ✓ Server running on port ${config.port}`)
  })
}

start().catch((error) => {
  console.error('[notification-service] Failed to start:', error)
  process.exit(1)
})

start().catch((err) => {
  console.error('[notification-service] Startup failed:', err.message)
  process.exit(1)
})

export default app
