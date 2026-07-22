import dotenv from 'dotenv'
import path from 'path'

// Load test environment
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set test environment
process.env.NODE_ENV = 'test'
