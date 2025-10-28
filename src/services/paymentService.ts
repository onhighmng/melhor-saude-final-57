import { supabase } from '@/integrations/supabase/client';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  metadata?: Record<string, any>;
  payment_method?: string;
  subscription_id?: string;
  invoice_id?: string;
}

interface PaymentIntent {
  id: string;
  client_secret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface SubscriptionData {
  customer_id: string;
  price_id: string;
  quantity?: number;
  trial_period_days?: number;
  metadata?: Record<string, any>;
}

interface Subscription {
  id: string;
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  customer_id: string;
  price_id: string;
  quantity: number;
  metadata: Record<string, any>;
}

interface InvoiceData {
  customer_id: string;
  subscription_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  items: Array<{
    price_id?: string;
    amount?: number;
    currency?: string;
    description: string;
    quantity?: number;
  }>;
}

interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount_paid: number;
  amount_due: number;
  currency: string;
  description: string;
  customer_id: string;
  subscription_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  due_date: string | null;
}

interface PaymentStats {
  total_revenue: number;
  successful_payments: number;
  failed_payments: number;
  refunded_payments: number;
  active_subscriptions: number;
  churn_rate: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
}

export class PaymentService {
  private static instance: PaymentService;
  private readonly webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(paymentData: PaymentData): Promise<PaymentIntent | null> {
    try {
      // In a real implementation, this would integrate with Stripe
      // For now, we'll simulate the process
      
      const paymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        status: 'requires_payment_method' as const,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        metadata: paymentData.metadata || {},
        created_at: new Date().toISOString()
      };

      // Store in database
      await this.storePaymentIntent(paymentIntent, paymentData);

      return paymentIntent;

    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with Stripe
      // For now, we'll simulate the process
      
      const paymentIntent = await this.getPaymentIntent(paymentIntentId);
      if (!paymentIntent) {
        throw new Error('Payment intent not found');
      }

      // Simulate payment confirmation
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        // Update payment intent status
        await this.updatePaymentIntentStatus(paymentIntentId, 'succeeded');
        
        // Create payment record
        await this.createPaymentRecord(paymentIntentId, paymentIntent);
        
        // Handle post-payment logic
        await this.handlePostPayment(paymentIntent);
      } else {
        await this.updatePaymentIntentStatus(paymentIntentId, 'canceled');
      }

      return success;

    } catch (error) {
      console.error('Error confirming payment intent:', error);
      return false;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(subscriptionData: SubscriptionData): Promise<Subscription | null> {
    try {
      // In a real implementation, this would integrate with Stripe
      // For now, we'll simulate the process
      
      const subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        trial_start: subscriptionData.trial_period_days ? new Date().toISOString() : null,
        trial_end: subscriptionData.trial_period_days ? new Date(Date.now() + subscriptionData.trial_period_days * 24 * 60 * 60 * 1000).toISOString() : null,
        customer_id: subscriptionData.customer_id,
        price_id: subscriptionData.price_id,
        quantity: subscriptionData.quantity || 1,
        metadata: subscriptionData.metadata || {}
      };

      // Store in database
      await this.storeSubscription(subscription);

      return subscription;

    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with Stripe
      // For now, we'll simulate the process
      
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Update subscription status
      await this.updateSubscriptionStatus(subscriptionId, 'canceled');
      
      // Handle post-cancellation logic
      await this.handlePostCancellation(subscription, immediately);

      return true;

    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(invoiceData: InvoiceData): Promise<Invoice | null> {
    try {
      // In a real implementation, this would integrate with Stripe
      // For now, we'll simulate the process
      
      const totalAmount = invoiceData.items.reduce((sum, item) => {
        return sum + (item.amount || 0) * (item.quantity || 1);
      }, 0);

      const invoice = {
        id: `in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        number: `INV-${Date.now()}`,
        status: 'open' as const,
        amount_paid: 0,
        amount_due: totalAmount,
        currency: 'eur',
        description: invoiceData.description || 'Invoice',
        customer_id: invoiceData.customer_id,
        subscription_id: invoiceData.subscription_id || null,
        metadata: invoiceData.metadata || {},
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      // Store in database
      await this.storeInvoice(invoice, invoiceData);

      return invoice;

    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  }

  /**
   * Process webhook
   */
  async processWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      // In a real implementation, this would verify the webhook signature
      // For now, we'll simulate the process
      
      const event = payload;
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return true;

    } catch (error) {
      console.error('Error processing webhook:', error);
      return false;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(days: number = 30): Promise<PaymentStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .gte('created_at', startDate.toISOString());

      if (paymentsError) throw paymentsError;

      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('status, created_at, amount')
        .gte('created_at', startDate.toISOString());

      if (subscriptionsError) throw subscriptionsError;

      const paymentsData = payments || [];
      const subscriptionsData = subscriptions || [];

      const totalRevenue = paymentsData
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount, 0);

      const successfulPayments = paymentsData.filter(p => p.status === 'succeeded').length;
      const failedPayments = paymentsData.filter(p => p.status === 'failed').length;
      const refundedPayments = paymentsData.filter(p => p.status === 'refunded').length;
      const activeSubscriptions = subscriptionsData.filter(s => s.status === 'active').length;

      // Calculate churn rate (simplified)
      const totalSubscriptions = subscriptionsData.length;
      const canceledSubscriptions = subscriptionsData.filter(s => s.status === 'canceled').length;
      const churnRate = totalSubscriptions > 0 ? (canceledSubscriptions / totalSubscriptions) * 100 : 0;

      // Calculate MRR and ARR
      const mrr = subscriptionsData
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      const arr = mrr * 12;

      return {
        total_revenue: totalRevenue,
        successful_payments: successfulPayments,
        failed_payments: failedPayments,
        refunded_payments: refundedPayments,
        active_subscriptions: activeSubscriptions,
        churn_rate: churnRate,
        mrr: mrr,
        arr: arr
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return {
        total_revenue: 0,
        successful_payments: 0,
        failed_payments: 0,
        refunded_payments: 0,
        active_subscriptions: 0,
        churn_rate: 0,
        mrr: 0,
        arr: 0
      };
    }
  }

  /**
   * Store payment intent in database
   */
  private async storePaymentIntent(paymentIntent: PaymentIntent, paymentData: PaymentData): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_intents')
        .insert({
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          description: paymentIntent.description,
          metadata: paymentIntent.metadata,
          customer_id: paymentData.customer_id,
          customer_email: paymentData.customer_email,
          customer_name: paymentData.customer_name,
          payment_method: paymentData.payment_method,
          subscription_id: paymentData.subscription_id,
          invoice_id: paymentData.invoice_id,
          created_at: paymentIntent.created_at
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing payment intent:', error);
      throw error;
    }
  }

  /**
   * Get payment intent from database
   */
  private async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    try {
      const { data, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', paymentIntentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting payment intent:', error);
      return null;
    }
  }

  /**
   * Update payment intent status
   */
  private async updatePaymentIntentStatus(paymentIntentId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_intents')
        .update({ status })
        .eq('id', paymentIntentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment intent status:', error);
      throw error;
    }
  }

  /**
   * Create payment record
   */
  private async createPaymentRecord(paymentIntentId: string, paymentIntent: PaymentIntent): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          payment_intent_id: paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          description: paymentIntent.description,
          metadata: paymentIntent.metadata,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  /**
   * Handle post-payment logic
   */
  private async handlePostPayment(paymentIntent: PaymentIntent): Promise<void> {
    try {
      // Update user progress
      if (paymentIntent.metadata.user_id) {
        await supabase
          .from('user_progress')
          .insert({
            user_id: paymentIntent.metadata.user_id,
            action_type: 'payment_completed',
            metadata: {
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              description: paymentIntent.description
            }
          });
      }

      // Send confirmation email
      if (paymentIntent.metadata.customer_email) {
        // This would integrate with the email service
        console.log('Sending payment confirmation email to:', paymentIntent.metadata.customer_email);
      }

    } catch (error) {
      console.error('Error handling post-payment:', error);
    }
  }

  /**
   * Store subscription in database
   */
  private async storeSubscription(subscription: Subscription): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          trial_start: subscription.trial_start,
          trial_end: subscription.trial_end,
          customer_id: subscription.customer_id,
          price_id: subscription.price_id,
          quantity: subscription.quantity,
          metadata: subscription.metadata,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription from database
   */
  private async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Update subscription status
   */
  private async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  /**
   * Handle post-cancellation logic
   */
  private async handlePostCancellation(subscription: Subscription, immediately: boolean): Promise<void> {
    try {
      // Update user progress
      if (subscription.metadata.user_id) {
        await supabase
          .from('user_progress')
          .insert({
            user_id: subscription.metadata.user_id,
            action_type: 'subscription_canceled',
            metadata: {
              subscription_id: subscription.id,
              immediately: immediately
            }
          });
      }

      // Send cancellation email
      if (subscription.metadata.customer_email) {
        // This would integrate with the email service
        console.log('Sending cancellation email to:', subscription.metadata.customer_email);
      }

    } catch (error) {
      console.error('Error handling post-cancellation:', error);
    }
  }

  /**
   * Store invoice in database
   */
  private async storeInvoice(invoice: Invoice, invoiceData: InvoiceData): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .insert({
          id: invoice.id,
          number: invoice.number,
          status: invoice.status,
          amount_paid: invoice.amount_paid,
          amount_due: invoice.amount_due,
          currency: invoice.currency,
          description: invoice.description,
          customer_id: invoice.customer_id,
          subscription_id: invoice.subscription_id,
          metadata: invoice.metadata,
          created_at: invoice.created_at,
          due_date: invoice.due_date
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing invoice:', error);
      throw error;
    }
  }

  /**
   * Handle payment succeeded webhook
   */
  private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id);
    // Handle payment success logic
  }

  /**
   * Handle payment failed webhook
   */
  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    console.log('Payment failed:', paymentIntent.id);
    // Handle payment failure logic
  }

  /**
   * Handle invoice payment succeeded webhook
   */
  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    console.log('Invoice payment succeeded:', invoice.id);
    // Handle invoice payment success logic
  }

  /**
   * Handle invoice payment failed webhook
   */
  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    console.log('Invoice payment failed:', invoice.id);
    // Handle invoice payment failure logic
  }

  /**
   * Handle subscription created webhook
   */
  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    console.log('Subscription created:', subscription.id);
    // Handle subscription creation logic
  }

  /**
   * Handle subscription updated webhook
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    console.log('Subscription updated:', subscription.id);
    // Handle subscription update logic
  }

  /**
   * Handle subscription deleted webhook
   */
  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    console.log('Subscription deleted:', subscription.id);
    // Handle subscription deletion logic
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
