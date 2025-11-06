import { useState } from 'react';
import { Phone } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { ProgressCard } from './components/ProgressCard';
import { SessionHistoryCard } from './components/SessionHistoryCard';
import { ProgressChecklistCard } from './components/ProgressChecklistCard';
import { UpcomingSessionsCard } from './components/UpcomingSessionsCard';
import { AgendarPage } from './components/AgendarPage';
import { PercursoPage } from './components/PercursoPage';
import { RecursosPage } from './components/RecursosPage';
import { ChatPage } from './components/ChatPage';
import { SettingsPage } from './components/SettingsPage';
import { SelectTopicPage } from './components/SelectTopicPage';
import { SelectSymptomsPage } from './components/SelectSymptomsPage';
import { PreDiagnosisResultPage } from './components/PreDiagnosisResultPage';
import { ChatBotPage } from './components/ChatBotPage';
import { SpecialistMatchedPage } from './components/SpecialistMatchedPage';
import { BookingCalendarPage } from './components/BookingCalendarPage';
import { BookingConfirmationPage } from './components/BookingConfirmationPage';

type AppView = 'inicio' | 'agendar' | 'conversa' | 'percurso' | 'recursos' | 'definicoes' | 'select-topic' | 'select-symptoms' | 'pre-diagnosis-result' | 'chatbot' | 'specialist-matched' | 'booking-calendar' | 'booking-confirmation';
type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [currentView, setCurrentView] = useState<AppView>('inicio');
  const [selectedPillar, setSelectedPillar] = useState<Pillar>('mental-health');
  const [selectedTopic, setSelectedTopic] = useState('depressao');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [sessionType, setSessionType] = useState<'online' | 'phone'>('online');
  const [bookedDate, setBookedDate] = useState<Date>(new Date());
  const [bookedTime, setBookedTime] = useState<string>('');

  // Show Specialist Consultation Flow
  if (currentView === 'select-topic') {
    return (
      <SelectTopicPage
        pillar={selectedPillar}
        onBack={() => {
          setCurrentView('agendar');
          setActiveTab('agendar');
        }}
        onContinue={(topic) => {
          setSelectedTopic(topic);
          setCurrentView('select-symptoms');
        }}
      />
    );
  }

  if (currentView === 'select-symptoms') {
    return (
      <SelectSymptomsPage
        pillar={selectedPillar}
        onBack={() => setCurrentView('select-topic')}
        onContinue={(symptoms, info) => {
          setSelectedSymptoms(symptoms);
          setAdditionalInfo(info);
          setCurrentView('pre-diagnosis-result');
        }}
      />
    );
  }

  if (currentView === 'pre-diagnosis-result') {
    return (
      <PreDiagnosisResultPage
        pillar={selectedPillar}
        onBack={() => setCurrentView('select-symptoms')}
        onBookSpecialist={() => setCurrentView('chatbot')}
        selectedTopic={selectedTopic}
        selectedSymptoms={selectedSymptoms}
        additionalInfo={additionalInfo}
      />
    );
  }

  if (currentView === 'chatbot') {
    return (
      <ChatBotPage
        pillar={selectedPillar}
        onBack={() => setCurrentView('pre-diagnosis-result')}
        onContinue={() => setCurrentView('specialist-matched')}
      />
    );
  }

  if (currentView === 'specialist-matched') {
    return (
      <SpecialistMatchedPage
        pillar={selectedPillar}
        onBack={() => setCurrentView('chatbot')}
        onContinue={(type) => {
          setSessionType(type);
          setCurrentView('booking-calendar');
        }}
      />
    );
  }

  if (currentView === 'booking-calendar') {
    return (
      <BookingCalendarPage
        pillar={selectedPillar}
        sessionType={sessionType}
        onBack={() => setCurrentView('specialist-matched')}
        onComplete={(date, time) => {
          setBookedDate(date);
          setBookedTime(time);
          setCurrentView('booking-confirmation');
        }}
      />
    );
  }

  if (currentView === 'booking-confirmation') {
    return (
      <BookingConfirmationPage
        pillar={selectedPillar}
        sessionType={sessionType}
        date={bookedDate}
        time={bookedTime}
        onGoHome={() => {
          setCurrentView('inicio');
          setActiveTab('inicio');
        }}
      />
    );
  }

  // Show Agendar page when that tab is active
  if (activeTab === 'agendar' || currentView === 'agendar') {
    return (
      <>
        <AgendarPage
          onBack={() => {
            setActiveTab('inicio');
            setCurrentView('inicio');
          }}
          onSelectPillar={(pillar) => {
            setSelectedPillar(pillar);
            setCurrentView('select-topic');
          }}
        />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  // Show Percurso page when that tab is active
  if (activeTab === 'percurso') {
    return (
      <>
        <PercursoPage />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  // Show Recursos page when that tab is active
  if (activeTab === 'recursos') {
    return (
      <>
        <RecursosPage />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  // Show Chat page when that tab is active
  if (activeTab === 'conversa') {
    return (
      <>
        <ChatPage />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  // Show Settings page when that tab is active
  if (activeTab === 'definicoes') {
    return (
      <>
        <SettingsPage />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">
                Olá, lorino rodrigues! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Bem-vinda de volta ao seus espaço de saúde e bem-estar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-5">
        {/* 1. Sessões Completas and Falar com Especialista */}
        <ProgressCard onStartConsultation={() => {
          setActiveTab('agendar');
          setCurrentView('agendar');
        }} />

        {/* 2. Progresso Pessoal */}
        <ProgressChecklistCard />

        {/* 3. Próximas Sessões */}
        <UpcomingSessionsCard />

        {/* 4. Recursos */}
        <SessionHistoryCard imageUrl="https://images.unsplash.com/photo-1744648525155-5ff1f8373766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3YWxraW5nJTIwc3Vuc2V0JTIwdGhlcmFweXxlbnwxfHx8fDE3NjIzNDcxMTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />

        {/* Call Button - Last Element */}
        <button className="w-full bg-blue-600 text-white rounded-full py-3 px-5 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform mb-6">
          <Phone className="w-5 h-5" />
          Solicitar Chamada
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}