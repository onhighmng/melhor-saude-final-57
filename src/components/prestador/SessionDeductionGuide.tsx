import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

const SessionDeductionGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Como Funciona a Dedução de Sessões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            O sistema deduz automaticamente sessões da conta do utilizador quando uma sessão é marcada como concluída.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium">Sessão Agendada</h4>
                <p className="text-sm text-gray-600">O utilizador agenda uma sessão através do sistema de agendamento por pilares.</p>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium">Sessão Realizada</h4>
                <p className="text-sm text-gray-600">O prestador marca a sessão como "Concluída" no sistema.</p>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium">Dedução Automática</h4>
                <p className="text-sm text-gray-600">
                  O sistema automaticamente:
                  <br />• Deduz 1 sessão da conta do utilizador
                  <br />• Prioriza sessões da empresa (se disponíveis)
                  <br />• Usa sessões pessoais como backup
                  <br />• Regista o log da utilização
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            Estados da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Estados que Deduzem Sessões:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Concluída</Badge>
                  <span className="text-sm">→ Deduz automaticamente</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Estados que NÃO Deduzem:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
                  <span className="text-sm">→ Reembolsa se já deduzida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-800">Não Compareceu</Badge>
                  <span className="text-sm">→ Mantém dedução</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Cenários Especiais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
              <h4 className="font-medium text-orange-800">Utilizador Sem Sessões Disponíveis</h4>
              <p className="text-sm text-orange-700">
                Se o utilizador não tiver sessões disponíveis, o prestador será notificado e a sessão não será deduzida automaticamente.
              </p>
            </div>

            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium text-blue-800">Prioridade de Dedução</h4>
              <p className="text-sm text-blue-700">
                O sistema tenta primeiro usar sessões da empresa. Se não houver, usa sessões pessoais do utilizador.
              </p>
            </div>

            <div className="p-3 border-l-4 border-green-500 bg-green-50">
              <h4 className="font-medium text-green-800">Cancelamento com Reembolso</h4>
              <p className="text-sm text-green-700">
                Se uma sessão já concluída for cancelada pelo prestador, a sessão é automaticamente reembolsada ao utilizador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Para Prestadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-medium mb-2">Ações Disponíveis:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>Concluir Sessão:</strong> Marca como concluída e deduz automaticamente</li>
              <li>• <strong>Cancelar com Reembolso:</strong> Cancela e reembolsa sessão (se já deduzida)</li>
              <li>• <strong>Marcar como Não Compareceu:</strong> Mantém a dedução da sessão</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionDeductionGuide;