import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  user_name?: string
  reset_link: string
  token: string
}

export const PasswordResetEmail = ({
  user_name,
  reset_link,
  token,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefinir a sua palavra-passe - Fruitful</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Redefinir Palavra-passe</Heading>
        
        <Text style={text}>
          {user_name ? `Olá ${user_name}` : 'Olá'},
        </Text>
        
        <Text style={text}>
          Recebemos um pedido para redefinir a palavra-passe da sua conta. 
          Se foi você que fez este pedido, clique no botão abaixo para criar uma nova palavra-passe.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={reset_link}>
            Redefinir Palavra-passe
          </Button>
        </Section>

        <Text style={text}>
          Ou, se preferir, pode copiar e colar este código temporário:
        </Text>
        <Text style={code}>{token}</Text>

        <Hr style={hr} />

        <Text style={smallText}>
          Este link é válido por 60 minutos por razões de segurança.
        </Text>

        <Text style={smallText}>
          Se não solicitou a redefinição da palavra-passe, pode ignorar este email em segurança. 
          A sua conta permanecerá segura.
        </Text>

        <Text style={footer}>
          <Link
            href="https://xn--melhorsade-udb.com"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            Fruitful
          </Link>
          <br />
          Plataforma de Bem-estar Integral
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const buttonContainer = {
  padding: '27px 0 27px',
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
}

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
}

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
  fontFamily: 'monaco, "courier new", courier, monospace',
  fontSize: '14px',
  margin: '16px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const smallText = {
  color: '#898989',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '12px',
  lineHeight: '22px',
  margin: '16px 0',
}

const footer = {
  color: '#898989',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
}