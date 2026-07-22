import Redis from 'ioredis'
import { ServiceEvent } from './types/index'

export interface EventPayload {
  event: ServiceEvent
  data: Record<string, unknown>
  timestamp: string
  serviceOrigin: string
}

export class EventBus {
  private publisher: Redis
  private subscriber: Redis

  constructor(redisUrl: string) {
    this.publisher = new Redis(redisUrl, { lazyConnect: true })
    this.subscriber = new Redis(redisUrl, { lazyConnect: true })
  }

  async connect(): Promise<void> {
    await this.publisher.connect()
    await this.subscriber.connect()
  }

  async publish(event: ServiceEvent, data: Record<string, unknown>, serviceOrigin: string): Promise<void> {
    const payload: EventPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      serviceOrigin,
    }
    await this.publisher.publish(event, JSON.stringify(payload))
  }

  subscribe(event: ServiceEvent, handler: (payload: EventPayload) => Promise<void>): void {
    this.subscriber.subscribe(event, (err) => {
      if (err) console.error(`[EventBus] Failed to subscribe to ${event}:`, err.message)
    })

    this.subscriber.on('message', async (channel, message) => {
      if (channel !== event) return
      try {
        const payload: EventPayload = JSON.parse(message)
        await handler(payload)
      } catch (err) {
        console.error(`[EventBus] Error handling event ${event}:`, err)
      }
    })
  }

  async disconnect(): Promise<void> {
    await this.publisher.quit()
    await this.subscriber.quit()
  }
}
