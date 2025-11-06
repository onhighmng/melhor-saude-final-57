import React from 'react';
import { N8NChatInterface } from '@/components/chat/N8NChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

/**
 * Test page for N8N Chatbot Integration
 * Navigate to /n8n-chat-test to access this page
 */
export default function N8NChatTest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">N8N Chatbot Test</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="font-semibold text-blue-900">
                Teste do Chatbot N8N
              </h2>
              <p className="text-sm text-blue-800">
                Esta página demonstra a integração com o webhook N8N. Todas as
                mensagens são enviadas para o endpoint configurado em{' '}
                <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                  src/config/constants.ts
                </code>
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>Endpoint:</strong>{' '}
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                    https://onhighpaula.app.n8n.cloud/webhook/b45c0bc9-9473-4711-a928-4e37907625d9
                  </code>
                </p>
                <p>
                  <strong>Formato:</strong> POST request com{' '}
                  <code className="bg-blue-100 px-1 rounded text-xs">
                    chatInput
                  </code>
                  ,{' '}
                  <code className="bg-blue-100 px-1 rounded text-xs">
                    message
                  </code>
                  , e{' '}
                  <code className="bg-blue-100 px-1 rounded text-xs">
                    sessionId
                  </code>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Chat Interface */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <N8NChatInterface
              additionalContext={{
                testMode: true,
                page: 'N8NChatTest',
                timestamp: new Date().toISOString(),
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Como Testar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Digite uma mensagem no campo de texto acima</li>
            <li>Pressione Enter ou clique no botão de enviar</li>
            <li>Abra as Developer Tools (F12) e vá para a aba Console</li>
            <li>
              Procure por logs com o prefixo{' '}
              <code className="bg-muted px-2 py-1 rounded text-xs">
                [N8NChatService]
              </code>
            </li>
            <li>Verifique o payload enviado e a resposta recebida</li>
          </ol>
        </Card>

        {/* Debug Info */}
        <Card className="p-6 bg-slate-50">
          <h3 className="font-semibold mb-3">Informações de Debug:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">
                <strong>Service:</strong>
              </p>
              <code className="bg-white px-3 py-2 rounded block text-xs">
                src/services/n8nChatService.ts
              </code>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">
                <strong>Hook:</strong>
              </p>
              <code className="bg-white px-3 py-2 rounded block text-xs">
                src/hooks/useN8NChat.ts
              </code>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">
                <strong>Component:</strong>
              </p>
              <code className="bg-white px-3 py-2 rounded block text-xs">
                src/components/chat/N8NChatInterface.tsx
              </code>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">
                <strong>Config:</strong>
              </p>
              <code className="bg-white px-3 py-2 rounded block text-xs">
                src/config/constants.ts
              </code>
            </div>
          </div>
        </Card>

        {/* Documentation Link */}
        <Card className="p-6 bg-green-50 border-green-200">
          <p className="text-sm text-green-800">
            📖 Para documentação completa, consulte:{' '}
            <code className="bg-green-100 px-2 py-1 rounded text-xs">
              N8N_CHATBOT_INTEGRATION_GUIDE.md
            </code>
          </p>
        </Card>
      </div>
    </div>
  );
}

