import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

beforeAll(() => {
  // Suppress console logs during tests
  jest.spyOn(console, 'log').mockImplementation(() => { })
  jest.spyOn(console, 'error').mockImplementation(() => { })
})

afterAll(() => {
  jest.restoreAllMocks()
})
