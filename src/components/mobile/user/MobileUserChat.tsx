import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function MobileUserChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Sou o seu assistente de bem-estar. Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: 'Obrigado pela sua mensagem! Estou aqui para ajudar com qualquer questão sobre a sua jornada de bem-estar.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-4">
          <h1 className="text-gray-900 text-xl font-bold">Chat</h1>
          <p className="text-gray-500 text-sm">Assistente de Bem-Estar</p>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-md mx-auto px-5 py-4 pb-24 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'bot' ? 'bg-blue-100' : 'bg-gray-200'
            }`}>
              {message.sender === 'bot' ? (
                <Bot className="w-5 h-5 text-blue-600" />
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className={`max-w-[70%] ${message.sender === 'user' ? 'items-end' : ''}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                message.sender === 'bot' 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-blue-600 text-white'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1 px-2">
                {message.timestamp.toLocaleTimeString('pt-PT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex gap-2">
          <Input
            type="text"
            placeholder="Escreva uma mensagem..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 rounded-full"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <MobileBottomNav userType="user" />
    </div>
  );
}

