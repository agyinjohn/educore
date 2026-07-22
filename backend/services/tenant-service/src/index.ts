import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './config'
import { connectDB } from './config/db'
import { eventBus } from './config/eventBus'
import tenantRoutes from './routes/tenant.routes'
import { ServiceEvent, EventPayload, Role } from '@educore/shared'

const app = express()

app.use(helmet())
app.disable('x-powered-by')
app.use(cors({ origin: false }))
app.use(morgan(config.isProduction ? 'combined' : 'dev'))
app.use(express.json({ limit: '10kb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tenant-service', timestamp: new Date().toISOString() })
})

app.use('/api/v1/tenants', tenantRoutes)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[tenant-service error]', err.message)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.isProduction ? {} : { stack: err.stack }),
  })
})

async function start() {
  await connectDB()
  await eventBus.connect()

  // Auto-provision school when a SCHOOL_OWNER registers (TENANT-001)
  eventBus.subscribe(ServiceEvent.USER_CREATED, async (payload: EventPayload) => {
    if (payload.data.role === Role.SCHOOL_OWNER) {
      console.log('[tenant-service] SCHOOL_OWNER registered — awaiting school creation:', payload.data.email)
      // School owner must call POST /api/v1/tenants to provision their school
    }
  })

  app.listen(config.port, () => {
    console.log(`[tenant-service] running on port ${config.port} (${config.nodeEnv})`)
  })
}

start().catch((err) => {
  console.error('[tenant-service] Startup failed:', err.message)
  process.exit(1)
})

export default app
