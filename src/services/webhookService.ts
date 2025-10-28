import { supabase } from '@/integrations/supabase/client';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { paymentService } from './paymentService';

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  source: string;
  created_at: string;
  processed: boolean;
  retry_count: number;
  error_message?: string;
}

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: string;
}

interface WebhookDelivery {
  id: string;
  subscription_id: string;
  event_id: string;
  status: 'pending' | 'delivered' | 'failed';
  response_code?: number;
  response_body?: string;
  delivered_at?: string;
  error_message?: string;
  retry_count: number;
}

export class WebhookService {
  private static instance: WebhookService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Create webhook subscription
   */
  async createSubscription(
    url: string,
    events: string[],
    secret?: string
  ): Promise<WebhookSubscription | null> {
    try {
      const subscription = {
        id: `whsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        events,
        secret: secret || this.generateSecret(),
        active: true,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .insert(subscription)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error creating webhook subscription:', error);
      return null;
    }
  }

  /**
   * Emit webhook event
   */
  async emitEvent(type: string, data: any, source: string = 'internal'): Promise<string | null> {
    try {
      const event: WebhookEvent = {
        id: `whev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        source,
        created_at: new Date().toISOString(),
        processed: false,
        retry_count: 0
      };

      // Store event
      const { data: storedEvent, error: storeError } = await supabase
        .from('webhook_events')
        .insert(event)
        .select()
        .single();

      if (storeError) throw storeError;

      // Process event
      await this.processEvent(storedEvent);

      return storedEvent.id;

    } catch (error) {
      console.error('Error emitting webhook event:', error);
      return null;
    }
  }

  /**
   * Process webhook event
   */
  private async processEvent(event: WebhookEvent): Promise<void> {
    try {
      // Get active subscriptions for this event type
      const { data: subscriptions, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .eq('active', true)
        .contains('events', [event.type]);

      if (error) throw error;

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No subscriptions found for event type: ${event.type}`);
        return;
      }

      // Create deliveries for each subscription
      const deliveryPromises = subscriptions.map(async (subscription) => {
        const delivery: WebhookDelivery = {
          id: `whdel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          subscription_id: subscription.id,
          event_id: event.id,
          status: 'pending',
          retry_count: 0
        };

        const { data: storedDelivery, error: deliveryError } = await supabase
          .from('webhook_deliveries')
          .insert(delivery)
          .select()
          .single();

        if (deliveryError) throw deliveryError;

        // Deliver webhook
        await this.deliverWebhook(storedDelivery, subscription, event);
      });

      await Promise.all(deliveryPromises);

      // Mark event as processed
      await supabase
        .from('webhook_events')
        .update({ processed: true })
        .eq('id', event.id);

    } catch (error) {
      console.error('Error processing webhook event:', error);
      
      // Update event with error
      await supabase
        .from('webhook_events')
        .update({ 
          error_message: error.message,
          retry_count: event.retry_count + 1
        })
        .eq('id', event.id);
    }
  }

  /**
   * Deliver webhook to subscription
   */
  private async deliverWebhook(
    delivery: WebhookDelivery,
    subscription: WebhookSubscription,
    event: WebhookEvent
  ): Promise<void> {
    try {
      const payload = {
        id: event.id,
        type: event.type,
        data: event.data,
        source: event.source,
        created_at: event.created_at
      };

      // Sign payload
      const signature = this.signPayload(JSON.stringify(payload), subscription.secret);

      // Send webhook
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event.type,
          'User-Agent': 'MelhorSaude-Webhook/1.0'
        },
        body: JSON.stringify(payload)
      });

      // Update delivery status
      await supabase
        .from('webhook_deliveries')
        .update({
          status: response.ok ? 'delivered' : 'failed',
          response_code: response.status,
          response_body: await response.text(),
          delivered_at: new Date().toISOString(),
          error_message: response.ok ? null : `HTTP ${response.status}`
        })
        .eq('id', delivery.id);

    } catch (error) {
      console.error('Error delivering webhook:', error);
      
      // Update delivery status to failed
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          error_message: error.message,
          retry_count: delivery.retry_count + 1
        })
        .eq('id', delivery.id);
    }
  }

  /**
   * Retry failed webhook deliveries
   */
  async retryFailedDeliveries(): Promise<void> {
    try {
      const { data: failedDeliveries, error } = await supabase
        .from('webhook_deliveries')
        .select(`
          *,
          webhook_subscriptions(*),
          webhook_events(*)
        `)
        .eq('status', 'failed')
        .lt('retry_count', this.MAX_RETRIES);

      if (error) throw error;

      for (const delivery of failedDeliveries || []) {
        try {
          await this.deliverWebhook(
            delivery,
            delivery.webhook_subscriptions,
            delivery.webhook_events
          );
        } catch (retryError) {
          console.error('Error retrying webhook delivery:', retryError);
        }
      }
    } catch (error) {
      console.error('Error retrying failed webhook deliveries:', error);
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleIncomingWebhook(
    url: string,
    payload: any,
    signature: string,
    eventType: string
  ): Promise<boolean> {
    try {
      // Find subscription
      const { data: subscription, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .eq('url', url)
        .eq('active', true)
        .single();

      if (error || !subscription) {
        throw new Error('Subscription not found');
      }

      // Verify signature
      if (!this.verifySignature(JSON.stringify(payload), signature, subscription.secret)) {
        throw new Error('Invalid signature');
      }

      // Process based on event type
      switch (eventType) {
        case 'email.delivered':
          await this.handleEmailDelivered(payload);
          break;
        case 'email.opened':
          await this.handleEmailOpened(payload);
          break;
        case 'email.clicked':
          await this.handleEmailClicked(payload);
          break;
        case 'email.bounced':
          await this.handleEmailBounced(payload);
          break;
        case 'sms.delivered':
          await this.handleSMSDelivered(payload);
          break;
        case 'sms.failed':
          await this.handleSMSFailed(payload);
          break;
        case 'payment.succeeded':
          await this.handlePaymentSucceeded(payload);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'subscription.created':
          await this.handleSubscriptionCreated(payload);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(payload);
          break;
        case 'subscription.canceled':
          await this.handleSubscriptionCanceled(payload);
          break;
        default:
          console.log(`Unhandled incoming webhook event: ${eventType}`);
      }

      return true;

    } catch (error) {
      console.error('Error handling incoming webhook:', error);
      return false;
    }
  }

  /**
   * Generate webhook secret
   */
  private generateSecret(): string {
    return `whsec_${Math.random().toString(36).substr(2, 32)}`;
  }

  /**
   * Sign payload
   */
  private signPayload(payload: string, secret: string): string {
    // In a real implementation, this would use HMAC-SHA256
    // For now, we'll use a simple hash
    const hash = btoa(payload + secret);
    return `sha256=${hash}`;
  }

  /**
   * Verify signature
   */
  private verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.signPayload(payload, secret);
    return signature === expectedSignature;
  }

  /**
   * Handle email delivered webhook
   */
  private async handleEmailDelivered(payload: any): Promise<void> {
    try {
      await supabase
        .from('email_deliveries')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', payload.delivery_id);

      // Emit internal event
      await this.emitEvent('email.delivered', payload, 'external');
    } catch (error) {
      console.error('Error handling email delivered:', error);
    }
  }

  /**
   * Handle email opened webhook
   */
  private async handleEmailOpened(payload: any): Promise<void> {
    try {
      await supabase
        .from('email_deliveries')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString()
        })
        .eq('id', payload.delivery_id);

      // Emit internal event
      await this.emitEvent('email.opened', payload, 'external');
    } catch (error) {
      console.error('Error handling email opened:', error);
    }
  }

  /**
   * Handle email clicked webhook
   */
  private async handleEmailClicked(payload: any): Promise<void> {
    try {
      await supabase
        .from('email_deliveries')
        .update({
          status: 'clicked',
          clicked_at: new Date().toISOString()
        })
        .eq('id', payload.delivery_id);

      // Emit internal event
      await this.emitEvent('email.clicked', payload, 'external');
    } catch (error) {
      console.error('Error handling email clicked:', error);
    }
  }

  /**
   * Handle email bounced webhook
   */
  private async handleEmailBounced(payload: any): Promise<void> {
    try {
      await supabase
        .from('email_deliveries')
        .update({
          status: 'bounced',
          error_message: payload.reason
        })
        .eq('id', payload.delivery_id);

      // Emit internal event
      await this.emitEvent('email.bounced', payload, 'external');
    } catch (error) {
      console.error('Error handling email bounced:', error);
    }
  }

  /**
   * Handle SMS delivered webhook
   */
  private async handleSMSDelivered(payload: any): Promise<void> {
    try {
      await supabase
        .from('sms_deliveries')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', payload.delivery_id);

      // Emit internal event
      await this.emitEvent('sms.delivered', payload, 'external');
    } catch (error) {
      console.error('Error handling SMS delivered:', error);
    }
  }

  /**
   * Handle SMS failed webhook
   */
  private async handleSMSFailed(payload: any): Promise<void> {
    try {
      await supabase
        .from('sms_deliveries')
        .update({
          status: 'failed',
          error_message: payload.reason
        })
        .eq('id', payload.delivery_id);

      // Emit internal event
      await this.emitEvent('sms.failed', payload, 'external');
    } catch (error) {
      console.error('Error handling SMS failed:', error);
    }
  }

  /**
   * Handle payment succeeded webhook
   */
  private async handlePaymentSucceeded(payload: any): Promise<void> {
    try {
      await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          processed_at: new Date().toISOString()
        })
        .eq('id', payload.payment_id);

      // Emit internal event
      await this.emitEvent('payment.succeeded', payload, 'external');
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
    }
  }

  /**
   * Handle payment failed webhook
   */
  private async handlePaymentFailed(payload: any): Promise<void> {
    try {
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_message: payload.reason
        })
        .eq('id', payload.payment_id);

      // Emit internal event
      await this.emitEvent('payment.failed', payload, 'external');
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }

  /**
   * Handle subscription created webhook
   */
  private async handleSubscriptionCreated(payload: any): Promise<void> {
    try {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .eq('id', payload.subscription_id);

      // Emit internal event
      await this.emitEvent('subscription.created', payload, 'external');
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  /**
   * Handle subscription updated webhook
   */
  private async handleSubscriptionUpdated(payload: any): Promise<void> {
    try {
      await supabase
        .from('subscriptions')
        .update({
          status: payload.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.subscription_id);

      // Emit internal event
      await this.emitEvent('subscription.updated', payload, 'external');
    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  /**
   * Handle subscription canceled webhook
   */
  private async handleSubscriptionCanceled(payload: any): Promise<void> {
    try {
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', payload.subscription_id);

      // Emit internal event
      await this.emitEvent('subscription.canceled', payload, 'external');
    } catch (error) {
      console.error('Error handling subscription canceled:', error);
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events, error: eventsError } = await supabase
        .from('webhook_events')
        .select('type, processed, created_at')
        .gte('created_at', startDate.toISOString());

      if (eventsError) throw eventsError;

      const { data: deliveries, error: deliveriesError } = await supabase
        .from('webhook_deliveries')
        .select('status, created_at')
        .gte('created_at', startDate.toISOString());

      if (deliveriesError) throw deliveriesError;

      const eventsData = events || [];
      const deliveriesData = deliveries || [];

      const totalEvents = eventsData.length;
      const processedEvents = eventsData.filter(e => e.processed).length;
      const totalDeliveries = deliveriesData.length;
      const successfulDeliveries = deliveriesData.filter(d => d.status === 'delivered').length;
      const failedDeliveries = deliveriesData.filter(d => d.status === 'failed').length;

      return {
        total_events: totalEvents,
        processed_events: processedEvents,
        total_deliveries: totalDeliveries,
        successful_deliveries: successfulDeliveries,
        failed_deliveries: failedDeliveries,
        success_rate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting webhook stats:', error);
      return {
        total_events: 0,
        processed_events: 0,
        total_deliveries: 0,
        successful_deliveries: 0,
        failed_deliveries: 0,
        success_rate: 0
      };
    }
  }
}

// Export singleton instance
export const webhookService = WebhookService.getInstance();
