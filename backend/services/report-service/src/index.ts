import path from 'path'
import dotenv from 'dotenv'

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './config/db'
import { config } from './config'
import reportRoutes from './routes/report.routes'

const app = express()

// Middleware
app.use(helmet())
app.disable('x-powered-by')
app.use(cors({ origin: false }))
app.use(morgan(config.isProduction ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'report-service', timestamp: new Date().toISOString() })
})

// Report API routes
app.use('/api/v1/reports', reportRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Start server
async function start() {
  try {
    await connectDB()
    app.listen(config.port, () => {
      console.log(`✓ report-service listening on port ${config.port} (${config.nodeEnv})`)
    })
  } catch (error) {
    console.error('[report-service] Startup failed:', error)
    process.exit(1)
  }
}

start()

export default app
