import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full px-6 py-8">
      {/* Back Button */}
      <Button
          variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 gap-2 text-lg"
      >
        <ArrowLeft className="h-5 w-5" />
        Voltar
      </Button>
      
      <PageHeader
        title="Termos e Condições"
        subtitle={`Última atualização: ${new Date().toLocaleDateString('pt-PT')}`}

      />
      
      <div className="prose prose-2xl max-w-none mt-8 space-y-12 text-lg">
        {/* Introduction */}
        <section className="mb-8">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-lg text-blue-800">
              <strong>Nota Importante:</strong> Estes Termos e Condições constituem um acordo legal vinculativo. 
              Recomendamos vivamente que leia cuidadosamente todos os termos antes de utilizar os nossos serviços.
            </p>
          </div>
          
          <h2 className="text-4xl font-semibold mb-6 text-gray-900">1. Informações Gerais</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-lg text-gray-600 mb-2"><strong>Empresa Responsável:</strong> Melhor Saúde, Limitada</p>
            <p className="text-lg text-gray-600 mb-2"><strong>Número de Identificação Fiscal:</strong> [A preencher]</p>
            <p className="text-lg text-gray-600 mb-2"><strong>Registo Comercial:</strong> [A preencher]</p>
            <p className="text-lg text-gray-600 mb-2"><strong>Capital Social:</strong> [Valor em Meticais - MZM]</p>
            <p className="text-lg text-gray-600 mb-2"><strong>Sede:</strong> Moçambique</p>
            <p className="text-lg text-gray-600 mb-2"><strong>Telefone:</strong> [+258] [A preencher]</p>
            <p className="text-lg text-gray-600"><strong>Email:</strong> contato@melhorsaude.co.mz</p>
          </div>
        </section>

        {/* Definitions */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">2. Definições</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2 text-blue-800">2.1 "Plataforma"</h3>
              <p className="text-lg text-blue-700">Refere-se ao sistema integrado de bem-estar corporativo "Melhor Saúde", incluindo todas as funcionalidades, recursos, interfaces, aplicações móveis e serviços relacionados de saúde mental, física, jurídica e financeira, bem como toda a infraestrutura tecnológica associada.</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2 text-green-800">2.2 "Utilizador"</h3>
              <p className="text-lg text-green-700 mb-2">Termo genérico que designa qualquer pessoa física que interage com a Plataforma, podendo assumir diferentes categorias:</p>
              <ul className="list-disc pl-6 space-y-1 text-lg text-green-700">
                <li><strong>Cliente/Colaborador:</strong> Funcionários de empresas parceiras que utilizam os serviços de bem-estar</li>
                <li><strong>Prestador de Serviços:</strong> Profissionais de saúde licenciados que fornecem consultas e terapias</li>
                <li><strong>Administrador:</strong> Pessoas autorizadas que gerem contas empresariais e utilizadores</li>
                <li><strong>Representante Empresarial:</strong> Pessoa responsável pela gestão da conta da empresa cliente</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2 text-purple-800">2.3 "Sessões"</h3>
              <p className="text-lg text-purple-700 mb-2">Qualquer interação estruturada de bem-estar disponibilizada através da Plataforma:</p>
              <ul className="list-disc pl-6 space-y-1 text-lg text-purple-700">
                <li>Consultas de psicologia e terapia</li>
                <li>Sessões de coaching e mentoria</li>
                <li>Aconselhamento jurídico e financeiro</li>
                <li>Consultas de saúde física e bem-estar</li>
                <li>Sessões individuais ou em grupo</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2 text-gray-800">2.4 "Dados Pessoais"</h3>
              <p className="text-lg text-gray-700 mb-2">Qualquer informação relativa a uma pessoa singular identificada ou identificável, conforme definido na Lei de Proteção de Dados Pessoais de Moçambique (Lei n.º 23/2021) e no RGPD, incluindo mas não limitado a:</p>
              <ul className="list-disc pl-6 space-y-1 text-lg text-gray-700">
                <li>Dados identificativos (nome, email, telefone)</li>
                <li>Dados de saúde e bem-estar</li>
                <li>Dados de utilização da Plataforma</li>
                <li>Dados técnicos e de navegação</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2 text-orange-800">2.5 "Empresa Parceira"</h3>
              <p className="text-lg text-orange-700">Entidade jurídica que contrata os serviços da Plataforma para disponibilizar bem-estar aos seus colaboradores, assumindo responsabilidade pelos termos contratuais e pelos utilizadores sob sua gestão.</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2 text-red-800">2.6 "Conteúdo"</h3>
              <p className="text-lg text-red-700">Todos os materiais, recursos educativos, vídeos, textos, ferramentas interativas e qualquer informação disponibilizada através da Plataforma para fins de apoio ao bem-estar dos utilizadores.</p>
            </div>
          </div>
        </section>

        {/* Acceptance of Terms */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">3. Aceitação dos Termos</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-lg text-yellow-800">
              <strong>Aviso:</strong> Ao aceder, registar-se ou utilizar a Plataforma, o Utilizador declara ter lido, compreendido e aceite integralmente estes Termos e Condições.
            </p>
          </div>
          <ul className="list-disc pl-6 space-y-2">
            <li>A utilização da Plataforma implica aceitação incondicional e integral dos presentes termos</li>
            <li>Se não concordar com qualquer disposição, deve cessar imediatamente a utilização</li>
            <li>A empresa reserva-se o direito de alterar estes termos a qualquer momento</li>
            <li>Alterações entrarão em vigor após publicação na Plataforma</li>
          </ul>
        </section>

        {/* Service Description */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">4. Descrição dos Serviços</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-green-800">4.1 Serviços Principais</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-green-700">
                <li>Plataforma de agendamento de sessões</li>
                <li>Portal de bem-estar e recursos educativos</li>
                <li>Sistema de gestão de utilizadores e empresas</li>
                <li>Relatórios e analytics de utilização</li>
                <li>Suporte técnico e cliente</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-blue-800">4.2 Serviços de Terceiros</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-blue-700">
                <li>Integração com prestadores de serviços externos</li>
                <li>Ferramentas de comunicação segura</li>
                <li>Plataformas de pagamento online</li>
                <li>Serviços de armazenamento em nuvem</li>
              </ul>
            </div>
          </div>
        </section>

        {/* User Registration and Accounts */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">5. Registo e Contas de Utilizador</h2>
          
          <h3 className="text-2xl font-medium mb-3">5.1 Requisitos de Registo</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Dados pessoais completos e verídicos</li>
            <li>Endereço de email válido e funcional</li>
            <li>Senha segura conforme políticas de segurança</li>
            <li>Confirmação da idade mínima (18 anos ou com consentimento dos responsáveis legais)</li>
            <li>Aceitação explícita da Política de Privacidade</li>
          </ul>

          <h3 className="text-2xl font-medium mb-3">5.2 Responsabilidades do Utilizador</h3>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <ul className="list-disc pl-6 space-y-1 text-lg">
              <li>Manter a confidencialidade das credenciais de acesso</li>
              <li>Notificar imediatamente qualquer uso não autorizado</li>
              <li>Atualizar informações pessoais quando necessário</li>
              <li>Respeitar os códigos de conduta estabelecidos</li>
              <li>Não partilhar a conta com terceiros</li>
              <li>Utilizar a Plataforma de forma ética e responsável</li>
              <li>Cumprir com os compromissos assumidos nas sessões</li>
            </ul>
          </div>
        </section>

        {/* Health and Medical Services */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">6. Serviços de Saúde e Médicos</h2>
          
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-4">
            <h3 className="text-2xl font-medium mb-3 text-green-800">6.1 Natureza dos Serviços</h3>
            <ul className="list-disc pl-6 space-y-2 text-lg text-green-700">
              <li>A Plataforma fornece serviços de bem-estar e suporte não médicos de emergência</li>
              <li>Todos os profissionais são licenciados e qualificados conforme legislação moçambicana</li>
              <li>Os serviços abrangem saúde mental, física, assistência jurídica e financeira</li>
              <li>Consultas e sessões são confidenciais e sigilosas</li>
            </ul>
          </div>

          <h3 className="text-2xl font-medium mb-3">6.2 Limitações Médicas</h3>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <ul className="list-disc pl-6 space-y-1 text-lg text-red-700">
              <li>A Plataforma NÃO substitui cuidados médicos de emergência</li>
              <li>A Plataforma NÃO oferece diagnósticos médicos ou prescrições</li>
              <li>Em emergências médicas, contacte 112 ou dirija-se a serviço médico</li>
              <li>Para questões médicas urgentes, consulte sempre um médico</li>
            </ul>
          </div>
        </section>

        {/* Privacy and Data Protection */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">7. Privacidade e Proteção de Dados</h2>
          
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-4">
            <h3 className="text-2xl font-medium mb-3 text-blue-800">7.1 Conformidade Legal</h3>
            <p className="text-lg text-blue-700 mb-3">
              A Plataforma está em conformidade com a Lei de Proteção de Dados Pessoais de Moçambique (Lei n.º 23/2021), o Regulamento Geral sobre a Proteção de Dados (RGPD) da União Europeia e demais legislação aplicável em Moçambique.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-lg text-blue-700">
              <li>Tratamento de dados com base legal clara</li>
              <li>Implementação de medidas técnicas e organizacionais adequadas</li>
              <li>Direitos dos titulares de dados totalmente respeitados</li>
              <li>Procedimentos de notificação de violações implementados</li>
            </ul>
          </div>

          <h3 className="text-2xl font-medium mb-3">7.2 Categorias de Dados</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Dados Identificativos</h4>
              <ul className="text-lg text-gray-600 space-y-1">
                <li>• Nome completo</li>
                <li>• Email</li>
                <li>• Número de telefone</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Dados de Saúde</h4>
              <ul className="text-lg text-gray-600 space-y-1">
                <li>• Informações de sessões</li>
                <li>• Avaliações de bem-estar</li>
                <li>• Histórico de consultas</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Dados Técnicos</h4>
              <ul className="text-lg text-gray-600 space-y-1">
                <li>• Endereços IP</li>
                <li>• Cookies</li>
                <li>• Logs de acesso</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-medium mb-3">7.3 Cookies e Tecnologia</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
              <li>A Plataforma utiliza cookies essenciais para funcionamento e análise</li>
              <li>Os utilizadores podem gerir preferências de cookies nas configurações</li>
              <li>Dados técnicos são recolhidos para melhorar a experiência e segurança</li>
              <li>Toda a tecnologia utilizada está em conformidade com as normas de segurança</li>
            </ul>
          </div>
        </section>

        {/* User Conduct and Prohibited Uses */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">8. Conduta do Utilizador e Usos Proibidos</h2>
          
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <h3 className="text-2xl font-medium mb-3 text-red-800">8.1 Atividades Proibidas</h3>
            <ul className="list-disc pl-6 space-y-1 text-lg text-red-700">
              <li>Utilização para fins ilegais ou não autorizados</li>
              <li>Transmissão de conteúdo ofensivo, difamatório ou inapropriado</li>
              <li>Tentativas de acesso não autorizado a sistemas ou dados</li>
              <li>Interferência com o funcionamento da Plataforma</li>
              <li>Uso de robots, spiders ou métodos automatizados</li>
              <li>Violação de direitos de propriedade intelectual</li>
              <li>Partilha de credenciais de acesso</li>
            </ul>
          </div>

          <h3 className="text-2xl font-medium mb-3">8.2 Consequências</h3>
          <p className="text-lg text-gray-600 mb-3">
            A violação destas disposições pode resultar em suspensão ou terminação imediata da conta, 
            sem direito a qualquer tipo de compensação ou reembolso.
          </p>
        </section>

        {/* Intellectual Property */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">9. Propriedade Intelectual</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-purple-800">9.1 Propriedade da Empresa</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-purple-700">
                <li>Software e código fonte da Plataforma</li>
                <li>Design, interface e experiência do utilizador</li>
                <li>Marca, logótipo e elementos visuais</li>
                <li>Conteúdo educativo e recursos</li>
                <li>Documentação técnica e manuais</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-blue-800">9.2 Limitações de Uso</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-blue-700">
                <li>Proibição de cópia, modificação ou distribuição</li>
                <li>Não é permitida engenharia reversa</li>
                <li>Reservado o direito de propriedade exclusiva</li>
                <li>Sanções por violação de direitos</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Payment Terms */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">10. Termos de Pagamento</h2>
          
          <h3 className="text-2xl font-medium mb-3">10.1 Métodos de Pagamento</h3>
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-lg text-green-700 mb-3">
              <strong>Método de Pagamento Atualmente Disponível:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-lg text-green-700">
              <li>Transferência bancária</li>
            </ul>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-lg text-green-800 font-medium mb-1">Processamento de Pagamentos:</p>
              <p className="text-lg text-green-700">Os pagamentos são processados após confirmação bancária e podem demorar até 2-3 dias úteis.</p>
            </div>
            <p className="text-lg text-green-600 mt-3 italic">
              Outros métodos de pagamento serão adicionados futuramente conforme disponibilidade.
            </p>
          </div>

          <h3 className="text-2xl font-medium mb-3">10.2 Política de Reembolsos</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Cancelamentos Até 24h</h4>
              <p className="text-lg text-gray-600">Reembolso integral, sem penalizações</p>
            </div>
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Cancelamentos 24-48h</h4>
              <p className="text-lg text-gray-600">Reembolso de 50% do valor pago</p>
            </div>
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Cancelamentos Após 48h</h4>
              <p className="text-lg text-gray-600">Sem direito a reembolso, salvo casos excecionais</p>
            </div>
          </div>
        </section>

        {/* Liability and Disclaimers */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">11. Responsabilidade e Isenções</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-4">
            <h3 className="text-2xl font-medium mb-3 text-yellow-800">11.1 Limitações de Responsabilidade</h3>
            <ul className="list-disc pl-6 space-y-2 text-lg text-yellow-700">
              <li>A Plataforma é fornecida "tal como está", sem garantias expressas ou implícitas</li>
              <li>Não nos responsabilizamos por danos indiretos, consequenciais ou lucros cessantes</li>
              <li>A responsabilidade está limitada ao valor efetivamente pago pelos serviços nos últimos 12 meses</li>
              <li>Exclusão de responsabilidade por falhas de terceiros, força maior ou mau uso da Plataforma</li>
              <li>A empresa reserva-se o direito de modificar ou descontinuar serviços com aviso prévio</li>
            </ul>
          </div>

          <h3 className="text-2xl font-medium mb-3">11.2 Avisos Importantes</h3>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-lg text-red-700 mb-2">
              <strong>Aviso Médico:</strong> A Plataforma não substitui cuidados médicos profissionais de emergência. 
              Em caso de emergência médica, contacte imediatamente os serviços de emergência (112) ou dirija-se ao serviço médico mais próximo.
            </p>
            <p className="text-lg text-red-700">
              <strong>Aviso Técnico:</strong> Embora nos esforcemos por manter a Plataforma sempre operacional, 
              não garantimos disponibilidade ininterrupta.
            </p>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">12. Rescisão</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-blue-800">12.1 Rescisão pelo Utilizador</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-blue-700">
                <li>Pode ser efetuada a qualquer momento</li>
                <li>Notificação prévia de 30 dias recomendada</li>
                <li>Acesso aos dados mantido por período transitório</li>
                <li>Direitos já adquiridos respeitados</li>
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-red-800">12.2 Rescisão pela Empresa</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-red-700">
                <li>Por violação dos termos e condições</li>
                <li>Por inatividade prolongada (6+ meses)</li>
                <li>Por razões de segurança ou legal</li>
                <li>Com aviso prévio de 30 dias quando possível</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Force Majeure */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">13. Força Maior</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-lg text-gray-700 mb-3">
              Não nos responsabilizamos por incapacidade ou atraso no cumprimento das obrigações 
              devido a circunstâncias extraordinárias fora do nosso controle, incluindo mas não limitado a:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-lg text-gray-600">
              <li>Desastres naturais, pandemias, epidemias</li>
              <li>Guerras, distúrbios civis, atos terroristas</li>
              <li>Greves, lockouts, problemas laborais</li>
              <li>Falhas de infraestrutura, cortes de energia</li>
              <li>Alterações na legislação aplicável</li>
            </ul>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">14. Lei Aplicável e Resolução de Conflitos</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-purple-800">14.1 Lei Aplicável</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-purple-700">
                <li>Lei de Moçambique aplicável</li>
                <li>Jurisdição dos tribunais de Moçambique</li>
                <li>Lei de Proteção de Dados Pessoais de Moçambique (Lei n.º 23/2021)</li>
                <li>Lei do Consumidor de Moçambique e práticas comerciais</li>
                <li>Constituição da República de Moçambique</li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-2xl font-medium mb-3 text-green-800">14.2 Resolução Alternativa</h3>
              <ul className="list-disc pl-6 space-y-1 text-lg text-green-700">
                <li>Arbitragem em Moçambique em caso de litígio</li>
                <li>Centro de Arbitragem de Maputo</li>
                <li>Direção Nacional do Consumidor (DNCON)</li>
                <li>Mediação prévia obrigatória</li>
                <li>Procedimento rápido para pequenos litígios</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">15. Contactos e Reclamações</h2>
          
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="text-2xl font-medium mb-4 text-blue-800">15.1 Informações de Contacto</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Suporte Geral</h4>
                <p className="text-lg text-blue-700">Email: suporte@melhorsaude.co.mz</p>
                <p className="text-lg text-blue-700">Telefone: [+258] [A preencher]</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proteção de Dados</h4>
                <p className="text-lg text-blue-700">Email: privacidade@melhorsaude.co.mz</p>
                <p className="text-lg text-blue-700">Encarregado de Proteção de Dados: [A preencher]</p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-medium mb-3 mt-6">15.2 Direito de Reclamação</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-lg text-gray-700 mb-3">
              Os utilizadores têm direito a apresentar reclamações sobre o serviço ou tratamento de dados pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-lg text-gray-600">
              <li>Autoridade Nacional de Proteção de Dados (ANPD) - Moçambique</li>
              <li>Direção Nacional do Consumidor (DNCON) - Moçambique</li>
              <li>Centro de Arbitragem de Maputo</li>
              <li>Provedor de Justiça de Moçambique</li>
            </ul>
          </div>
        </section>

        {/* Final Provisions */}
        <section className="mb-8">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900">16. Disposições Finais</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2">16.1 Integridade do Acordo</h3>
              <p className="text-lg text-gray-700">
                Estes Termos e Condições constituem o acordo integral entre as partes e substituem todos os acordos anteriores relativos ao mesmo assunto.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2">16.2 Modificações</h3>
              <p className="text-lg text-gray-700">
                Qualquer modificação a estes termos será comunicada com antecedência mínima de 30 dias e publicada na Plataforma.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2">16.3 Divisibilidade</h3>
              <p className="text-lg text-gray-700">
                Se alguma disposição destes termos for considerada inválida ou inaplicável, as demais disposições permanecerão em pleno vigor.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="text-2xl font-medium mb-2 text-blue-800">16.4 Versão e Data</h3>
              <p className="text-lg text-blue-700">
                <strong>Versão:</strong> 1.0<br/>
                <strong>Data de entrada em vigor:</strong> {new Date().toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>
        </section>

        {/* Acceptance */}
        <section className="mb-8">
          <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg text-center">
            <h3 className="text-2xl font-medium mb-4 text-green-800">Declaração de Aceitação</h3>
            <p className="text-lg text-green-700 mb-4">
              Ao utilizar a Plataforma, declaro ter lido, compreendido e aceite integralmente todos os 
              termos e condições expostos neste documento.
            </p>
            <p className="text-base text-green-600">
              Este documento está disponível para consulta permanente na secção "Termos e Condições" da Plataforma.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
