import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Input } from './ui/input';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface ChatBotPageProps {
  pillar: Pillar;
  onBack: () => void;
  onContinue: () => void;
}

export function ChatBotPage({ pillar, onBack, onContinue }: ChatBotPageProps) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([]);

  const pillarTitles: Record<Pillar, string> = {
    'mental-health': 'Assistente de Saúde Mental',
    'physical-wellness': 'Assistente de Bem-estar Físico',
    'financial-assistance': 'Assistente Financeiro',
    'legal-assistance': 'Assistente Jurídico'
  };

  const suggestionsByPillar: Record<Pillar, string[]> = {
    'mental-health': [
      'Gostaria de partilhar o que "sinto"',
      'Já percebi o que preciso',
      'Estou um pouco indeciso sobre o que preciso'
    ],
    'physical-wellness': [
      'Preciso de ajuda com exercícios',
      'Quero melhorar a minha alimentação',
      'Tenho dúvidas sobre o meu plano'
    ],
    'financial-assistance': [
      'Preciso de ajuda urgente',
      'Quero planear o meu futuro financeiro',
      'Tenho dúvidas sobre gestão de dívidas'
    ],
    'legal-assistance': [
      'A minha situação é urgente',
      'Preciso de aconselhamento',
      'Não sei por onde começar'
    ]
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, { role: 'user', text: message }]);
      setMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'bot', 
          text: 'Obrigado por partilhar. Vou encaminhá-lo para um especialista que pode ajudá-lo melhor.' 
        }]);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setChatMessages([...chatMessages, { role: 'user', text: suggestion }]);
    
    // Simulate bot response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Entendo. Vou conectá-lo com um especialista qualificado para ajudá-lo.' 
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <button
              onClick={onContinue}
              className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
            >
              Solicitar Suporte →
            </button>
          </div>
          <h1 className="text-gray-900">{pillarTitles[pillar]}</h1>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8 flex flex-col items-center justify-center">
        {chatMessages.length === 0 ? (
          <>
            <h2 className="text-gray-900 mb-8 text-center">
              Conversa comigo, com privacidade e atenção.
            </h2>

            {/* Input Field */}
            <div className="w-full max-w-2xl mb-6">
              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua pergunta..."
                  className="pr-12 py-6 rounded-xl border-gray-200"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Suggestion Buttons */}
            <div className="flex flex-wrap gap-3 justify-center max-w-3xl">
              {suggestionsByPillar[pillar].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="w-full max-w-2xl space-y-4 mb-6">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Field at Bottom */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua pergunta..."
                  className="pr-12 py-6 rounded-xl border-gray-200"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Continue to Specialist Button */}
            <button
              onClick={onContinue}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95 shadow-lg shadow-blue-600/30"
            >
              Continuar para Especialista
            </button>
          </>
        )}
      </div>
    </div>
  );
}
