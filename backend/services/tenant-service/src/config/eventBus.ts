import { EventBus } from '@educore/shared'
import { config } from './index'

export const eventBus = new EventBus(config.redis.url)
