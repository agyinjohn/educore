import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { config } from './config'
import { connectDB } from './config/db'
import { eventBus } from './config/eventBus'
import { connectRedis } from './config/redis'
import authRoutes from './routes/auth.routes'

const app = express()

app.use(helmet())
app.disable('x-powered-by')
app.use(cors({ origin: false }))
app.use(morgan(config.isProduction ? 'combined' : 'dev'))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() })
})

app.use('/api/v1/auth', authRoutes)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[auth-service error]', err.message)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.isProduction ? {} : { stack: err.stack }),
  })
})

connectDB()
  .then(() => connectRedis())
  .then(() => eventBus.connect())
  .then(() => {
    app.listen(config.port, () => {
      console.log(`[auth-service] running on port ${config.port} (${config.nodeEnv})`)
    })
  })
  .catch((err) => {
    console.error('[auth-service] Startup failed:', err.message)
    process.exit(1)
  })

export default app
