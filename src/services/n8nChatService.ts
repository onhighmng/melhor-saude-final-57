import { N8N_CHATBOT_WEBHOOK_URL } from '@/config/constants';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface N8NChatRequest {
  message?: string;
  chatInput?: string;
  sessionId: string;
  userId?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface N8NChatResponse {
  message: string;
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Service to communicate with N8N chatbot webhook
 */
export class N8NChatService {
  private static instance: N8NChatService;
  private webhookUrl: string;

  private constructor() {
    this.webhookUrl = N8N_CHATBOT_WEBHOOK_URL;
  }

  static getInstance(): N8NChatService {
    if (!N8NChatService.instance) {
      N8NChatService.instance = new N8NChatService();
    }
    return N8NChatService.instance;
  }

  /**
   * Send a message to the N8N chatbot webhook
   */
  async sendMessage(request: N8NChatRequest): Promise<N8NChatResponse> {
    try {
      const messageContent = request.message || request.chatInput || '';
      
      // Build the payload for N8N webhook
      const payload: any = {
        chatInput: messageContent,  // Primary field for N8N
        message: messageContent,     // Backup field
        sessionId: request.sessionId, // Required sessionId
      };

      // Add optional fields if provided
      if (request.userId) {
        payload.userId = request.userId;
      }

      if (request.context) {
        payload.context = request.context;
      }

      if (request.metadata) {
        payload.metadata = {
          timestamp: new Date().toISOString(),
          ...request.metadata,
        };
      }

      console.log('[N8NChatService] Sending to webhook:', {
        url: this.webhookUrl,
        payload,
      });

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('[N8NChatService] Received response:', data);

      return {
        message: data.message || data.response || data.output || data.text || 'No response from chatbot',
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('[N8NChatService] Error sending message:', error);
      return {
        message: 'Failed to get response from chatbot',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a message with conversation history
   */
  async sendMessageWithHistory(
    message: string,
    history: ChatMessage[],
    sessionId: string,
    userId?: string,
    additionalContext?: Record<string, any>
  ): Promise<N8NChatResponse> {
    return this.sendMessage({
      chatInput: message,
      message,
      sessionId,
      userId,
      context: {
        history: history.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
        ...additionalContext,
      },
    });
  }

  /**
   * Update webhook URL (useful for testing or dynamic configuration)
   */
  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  /**
   * Get current webhook URL
   */
  getWebhookUrl(): string {
    return this.webhookUrl;
  }
}

// Export singleton instance
export const n8nChatService = N8NChatService.getInstance();

