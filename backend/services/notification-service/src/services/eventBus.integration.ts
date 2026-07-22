import { EventBus, ServiceEvent, EventPayload } from '@educore/shared'
import { notificationService } from './notification.service'
import { messagingService } from './messaging.service'
import { config } from '../config'

/**
 * Phase 4 — Event Bus Integration
 * Listen for events from other services and send automatic notifications
 */

export async function initializeEventBus() {
  const eventBus = new EventBus(config.redisUrl)

  await eventBus.connect()
  console.log('[notification-service] ✓ Event bus connected')

  /**
   * ACAD-013: When student is marked absent, notify parent
   * Listen for ATTENDANCE_MARKED event
   */
  eventBus.subscribe(ServiceEvent.ATTENDANCE_MARKED, async (payload: EventPayload) => {
    try {
      const { school_id, student_id, studentName, status, date, className } = payload.data

      // Only notify if student is absent
      if (status !== 'absent') return

      console.log(
        `[notification-service] attendance.marked — student ${studentName} absent on ${date}`
      )

      // TODO: Query parent-service to get parent contact info
      // Send SMS/push notification to parents
      // "Your child {{studentName}} was absent from {{className}} on {{date}}"
    } catch (error: any) {
      console.error('[notification-service] Error processing ATTENDANCE_MARKED:', error.message)
    }
  })

  /**
   * When grades are published, notify student and parents
   */
  eventBus.subscribe(ServiceEvent.GRADE_PUBLISHED, async (payload: EventPayload) => {
    try {
      const { school_id, student_id, studentName, subject, score, term } = payload.data

      console.log(`[notification-service] grade.published — ${studentName} scored ${score} in ${subject}`)

      // TODO: Create notification using notificationService
      // "Your {{subject}} grade for {{term}} is {{score}}"
      // Send to student portal + email to parents
    } catch (error: any) {
      console.error('[notification-service] Error processing GRADE_PUBLISHED:', error.message)
    }
  })

  /**
   * When payment is received, send receipt
   */
  eventBus.subscribe(ServiceEvent.PAYMENT_RECEIVED, async (payload: EventPayload) => {
    try {
      const { school_id, student_id, studentName, amount, date, paymentId } = payload.data

      console.log(
        `[notification-service] payment.received — ${studentName} paid ${amount} on ${date}`
      )

      // TODO: Send payment receipt email
      // "Payment of {{amount}} received on {{date}}. Reference: {{paymentId}}"
    } catch (error: any) {
      console.error('[notification-service] Error processing PAYMENT_RECEIVED:', error.message)
    }
  })

  /**
   * When new user is created, send welcome email
   */
  eventBus.subscribe(ServiceEvent.USER_CREATED, async (payload: EventPayload) => {
    try {
      const { school_id, user_id, email, name, role } = payload.data

      console.log(`[notification-service] user.created — welcome email to ${email}`)

      // TODO: Send welcome email
      // "Welcome to EduCore, {{name}}!"
    } catch (error: any) {
      console.error('[notification-service] Error processing USER_CREATED:', error.message)
    }
  })

  /**
   * Emit notification.sent event when bulk notification is sent
   * (other services can listen and log, etc.)
   */

  return eventBus
}

export { EventBus }
