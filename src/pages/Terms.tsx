import { PageHeader } from "@/components/ui/page-header";

export default function Terms() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <PageHeader
        title="Termos e Condições"
        subtitle="Termos de utilização da plataforma"
      />
      
      <div className="prose prose-lg max-w-none mt-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-4">
            Ao aceder e utilizar esta plataforma, concorda em ficar vinculado a estes termos e condições de utilização.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Utilização da Plataforma</h2>
          <p className="mb-4">
            Esta plataforma destina-se a facilitar o agendamento e gestão de sessões de saúde mental e bem-estar.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Deve fornecer informações precisas e atualizadas</li>
            <li>É responsável por manter a confidencialidade da sua conta</li>
            <li>Não deve utilizar a plataforma para fins ilegais ou não autorizados</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Privacidade e Proteção de Dados</h2>
          <p className="mb-4">
            Respeitamos a sua privacidade e protegemos os seus dados pessoais de acordo com o RGPD e legislação aplicável.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Responsabilidades</h2>
          <p className="mb-4">
            A plataforma atua como intermediário entre utilizadores e prestadores de serviços de saúde mental.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Alterações aos Termos</h2>
          <p className="mb-4">
            Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações entrarão em vigor após a publicação na plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contacto</h2>
          <p className="mb-4">
            Para questões sobre estes termos, entre em contacto através da secção de ajuda da plataforma.
          </p>
        </section>
      </div>
    </div>
  );
}