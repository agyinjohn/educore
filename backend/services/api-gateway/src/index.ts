import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './config'
import proxyRoutes from './routes/proxy'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

const app = express()

// ─── Security Headers (OWASP) ─────────────────────────────────────────────────
app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
)

// ─── CORS — whitelist only (AUTH-013, Section 4.3) ────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use(morgan(config.isProduction ? 'combined' : 'dev'))

// ─── Body Parsing — only for non-proxied routes (health check etc) ──────────
// NOTE: do NOT parse body globally — proxy routes need the raw stream intact

// ─── Disable fingerprinting ───────────────────────────────────────────────────
app.disable('x-powered-by')

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() })
})

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', proxyRoutes)

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`[api-gateway] running on port ${config.port} (${config.nodeEnv})`)
})

export default app
