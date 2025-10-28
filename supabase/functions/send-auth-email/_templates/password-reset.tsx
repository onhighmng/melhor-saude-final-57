import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PasswordResetEmailProps {
  confirmationUrl: string;
  email: string;
}

export const PasswordResetEmail = ({
  confirmationUrl,
  email,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Recupere a sua palavra-passe - Melhor Saúde</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Recuperar Palavra-passe</Heading>
        
        <Text style={text}>
          Olá,
        </Text>
        
        <Text style={text}>
          Recebemos um pedido para recuperar a palavra-passe da sua conta <strong>{email}</strong> na plataforma Melhor Saúde.
        </Text>
        
        <Section style={buttonContainer}>
          <Link
            href={confirmationUrl}
            target="_blank"
            style={button}
          >
            Definir Nova Palavra-passe
          </Link>
        </Section>
        
        <Text style={text}>
          Ou copie e cole este link no seu navegador:
        </Text>
        
        <Text style={linkText}>
          {confirmationUrl}
        </Text>
        
        <Text style={textMuted}>
          Se não solicitou esta recuperação, pode ignorar este email com segurança. A sua palavra-passe não será alterada.
        </Text>
        
        <Text style={textMuted}>
          Este link é válido por 1 hora.
        </Text>
        
        <Text style={footer}>
          <strong>Melhor Saúde</strong>
          <br />
          Cuidamos do seu bem-estar integral
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
};

const h1 = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 30px',
  padding: '0',
  lineHeight: '1.3',
};

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const textMuted = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const linkText = {
  color: '#3b82f6',
  fontSize: '14px',
  lineHeight: '24px',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '20px',
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #e2e8f0',
  textAlign: 'center' as const,
};
