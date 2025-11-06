import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatPage() {
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

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('olá') || input.includes('oi') || input.includes('bom dia') || input.includes('boa tarde')) {
      return 'Olá! Como posso ajudá-lo hoje? Pode perguntar sobre sessões, recursos de bem-estar ou marcar uma consulta.';
    }
    
    if (input.includes('sessão') || input.includes('agendar') || input.includes('marcar')) {
      return 'Para agendar uma sessão, pode ir à página "Agendar" através do menu inferior. Posso ajudá-lo a escolher o melhor especialista para as suas necessidades.';
    }
    
    if (input.includes('ajuda') || input.includes('como')) {
      return 'Estou aqui para ajudar! Pode perguntar sobre:\n• Marcar sessões\n• Consultar o seu progresso\n• Informações sobre recursos de bem-estar\n• Informações sobre os nossos especialistas';
    }
    
    if (input.includes('especialista') || input.includes('terapeuta')) {
      return 'Temos especialistas em várias áreas: Saúde Mental, Bem-estar Físico, Assistência Financeira e Assistência Jurídica. Qual área lhe interessa?';
    }
    
    return 'Obrigado pela sua mensagem! Estou aqui para ajudar com qualquer questão sobre a sua jornada de bem-estar. Pode ser mais específico sobre o que precisa?';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Assistente Virtual</h1>
              <p className="text-gray-500 text-sm">
                Sempre disponível para ajudar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.sender === 'bot' ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col max-w-[75%] ${
                    message.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {message.text}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 sticky bottom-20 z-40">
        <div className="max-w-6xl mx-auto px-5 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escreva a sua mensagem..."
                className="w-full bg-transparent border-0 outline-none resize-none text-gray-900 placeholder-gray-400 text-sm max-h-32"
                rows={1}
                style={{
                  minHeight: '24px',
                  maxHeight: '128px'
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                inputText.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
