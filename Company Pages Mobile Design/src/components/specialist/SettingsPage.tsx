import { useState } from 'react';
import { User, Euro, Clock, Lock, Shield, X, Info, ChevronLeft } from 'lucide-react';

type ModalType = 'personal' | 'financial' | 'availability' | 'security' | null;

export function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Configurações</h1>
          <p className="text-slate-600 text-sm">
            Gerir as suas informações pessoais e configurações
          </p>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Personal Information */}
          <button
            onClick={() => setActiveModal('personal')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 aspect-square flex flex-col justify-center hover:shadow-lg transition-shadow text-left"
          >
            <div className="bg-blue-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center mb-4">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 mb-2">Informação Pessoal</h2>
            <p className="text-slate-700 text-sm">Dra. Maria Santos</p>
          </button>

          {/* Financial Information */}
          <button
            onClick={() => setActiveModal('financial')}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 aspect-square flex flex-col justify-center hover:shadow-lg transition-shadow text-left"
          >
            <div className="bg-emerald-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center mb-4">
              <Euro className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 mb-2">Informação Financeira</h2>
            <p className="text-slate-700 text-sm">350 MZN/sessão</p>
          </button>

          {/* Availability */}
          <button
            onClick={() => setActiveModal('availability')}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 aspect-square flex flex-col justify-center hover:shadow-lg transition-shadow text-left"
          >
            <div className="bg-purple-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 mb-2">Disponibilidade</h2>
            <p className="text-slate-700 text-sm mb-1">09:00 - 17:00</p>
            <p className="text-slate-600 text-xs">Gerir Horários</p>
          </button>

          {/* Security */}
          <button
            onClick={() => setActiveModal('security')}
            className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-3xl p-6 aspect-square flex flex-col justify-center hover:shadow-lg transition-shadow text-left"
          >
            <div className="bg-rose-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 mb-2">Segurança</h2>
            <p className="text-slate-700 text-sm">Alterar palavra-passe</p>
          </button>
        </div>

        {/* Data Protection */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 rounded-2xl p-3 shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-2">Proteção de Dados</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Os seus dados estão protegidos e seguros no ecossistema RGPD. Apenas as informações 
                necessárias para o funcionamento da plataforma são recolhidas e armazenadas. Pode solicitar 
                a eliminação dos seus dados a qualquer momento através do botão abaixo.
              </p>
              <button className="mt-4 text-blue-600 text-sm hover:text-blue-700 transition-colors">
                Multi-Device
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Modal */}
      {activeModal === 'personal' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative shadow-xl">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-slate-900">Informação Pessoal</h2>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl">
                DM
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-700 text-sm mb-2">Nome completo</label>
                <input
                  type="text"
                  defaultValue="Dra. Maria Santos"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="maria.santos@email.pt"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm mb-2">Pilar</label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                    Saúde Mental
                  </span>
                </div>
                <p className="text-slate-500 text-xs">(1 pilar adic pode ser adicionado)</p>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
              Editar
            </button>
          </div>
        </div>
      )}

      {/* Financial Information Modal */}
      {activeModal === 'financial' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative shadow-xl">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-slate-900">Informação Financeira</h2>
            </div>

            {/* Session Value */}
            <div className="mb-6">
              <label className="block text-slate-700 mb-3">Valor por sessão (MZN)</label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-400">€</span>
                <input
                  type="number"
                  defaultValue="350"
                  className="text-3xl border-none focus:outline-none w-full"
                />
              </div>
              <p className="text-slate-500 text-xs">
                Selecione a moeda para visualização e cite para em meticais
              </p>
            </div>

            {/* Payment Information */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-start gap-2 mb-3">
                <Info className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                <h3 className="text-slate-900 text-sm">Informação sobre Pagamentos</h3>
              </div>
              <ul className="space-y-1.5 text-slate-600 text-sm ml-6">
                <li>• Métodos por moedas por plataforma</li>
                <li>• Moedas disponíveis em cada plataforma</li>
                <li>• Pagamentos são processados mensalmente</li>
                <li>• Consulte a seção "Desempenho" para detalhes financeiros</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {activeModal === 'availability' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative shadow-xl max-h-[85vh] overflow-y-auto">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-slate-900">Disponibilidade</h2>
            </div>

            <p className="text-slate-600 text-sm mb-6">
              Defina os horários em que está disponível para sessões
            </p>

            {/* Days of Week */}
            <div className="space-y-3">
              {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((day, idx) => (
                <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-900">{day}</span>
                  {idx < 5 ? (
                    <span className="text-slate-600 text-sm">09:00 - 17:00</span>
                  ) : (
                    <span className="text-slate-400 text-sm">Indisponível</span>
                  )}
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors mt-6">
              Atualizar Horários
            </button>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative shadow-xl">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-slate-900">Segurança</h2>
            </div>

            <p className="text-slate-600 text-sm mb-6">
              Altere a sua palavra-passe para manter a sua conta segura
            </p>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-700 text-sm mb-2">Palavra-passe atual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm mb-2">Nova palavra-passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm mb-2">Confirmar nova palavra-passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors">
              Alterar Palavra-passe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
