import dotenv from 'dotenv'
import path from 'path'

// Load test environment — resolves to backend/.env.test (this was pointing
// one directory too shallow, at backend/services/.env.test, which doesn't
// exist, so it silently loaded nothing).
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.test') })

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educore_finance_test'
