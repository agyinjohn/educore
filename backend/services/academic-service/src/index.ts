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
import academicRoutes from './routes/academic.routes'

const app = express()

// Security & parsing
app.use(helmet())
app.disable('x-powered-by')
app.use(cors({ origin: false }))
app.use(morgan(config.isProduction ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'academic-service', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/v1/academic', academicRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[academic-service error]', err.message)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.isProduction ? {} : { stack: err.stack }),
  })
})

async function start() {
  await connectDB()

  app.listen(config.port, () => {
    console.log(`[academic-service] running on port ${config.port} (${config.nodeEnv})`)
  })
}

start().catch((err) => {
  console.error('[academic-service] Startup failed:', err.message)
  process.exit(1)
})

export default app
