/**
 * Email templates for booking notifications
 */

interface BookingEmailData {
  userName: string;
  providerName: string;
  date: string;
  time: string;
  pillar: string;
  meetingLink?: string;
  meetingType: string;
}

export const getBookingConfirmationEmail = (data: BookingEmailData): string => {
  const pillarNames = {
    'saude_mental': 'Saúde Mental',
    'bem_estar_fisico': 'Bem-Estar Físico',
    'assistencia_financeira': 'Assistência Financeira',
    'assistencia_juridica': 'Assistência Jurídica'
  };

  const pillarName = pillarNames[data.pillar as keyof typeof pillarNames] || data.pillar;
  const meetingInfo = data.meetingType === 'virtual' && data.meetingLink
    ? `<p><strong>Link da Reunião:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`
    : '<p><strong>Tipo de Reunião:</strong> Telefónica</p>';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail { margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid #4F46E5; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sessão Agendada</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.userName}</strong>,</p>
            <p>A sua sessão foi agendada com sucesso!</p>
            
            <div class="detail">
              <p><strong>Prestador:</strong> ${data.providerName}</p>
              <p><strong>Área:</strong> ${pillarName}</p>
              <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
              ${meetingInfo}
            </div>

            <p>Por favor, esteja disponível 5 minutos antes da hora marcada.</p>
            
            <a href="https://www.melhorsaúde.com/user/sessions" class="button">Ver Minhas Sessões</a>
          </div>
          <div class="footer">
            <p>Melhor Saúde</p>
            <p>Cuidando de si e do seu bem-estar</p>
            <p style="font-size: 12px; margin-top: 8px;">Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getBookingCancellationEmail = (data: Omit<BookingEmailData, 'meetingLink' | 'meetingType'>): string => {
  const pillarNames = {
    'saude_mental': 'Saúde Mental',
    'bem_estar_fisico': 'Bem-Estar Físico',
    'assistencia_financeira': 'Assistência Financeira',
    'assistencia_juridica': 'Assistência Jurídica'
  };

  const pillarName = pillarNames[data.pillar as keyof typeof pillarNames] || data.pillar;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail { margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid #EF4444; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sessão Cancelada</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.userName}</strong>,</p>
            <p>A sua sessão foi cancelada.</p>
            
            <div class="detail">
              <p><strong>Prestador:</strong> ${data.providerName}</p>
              <p><strong>Área:</strong> ${pillarName}</p>
              <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
            </div>

            <p>Pode agendar uma nova sessão a qualquer momento através da plataforma.</p>
            
            <a href="https://www.melhorsaúde.com/user/book" class="button">Agendar Nova Sessão</a>
          </div>
          <div class="footer">
            <p>Melhor Saúde</p>
            <p>Cuidando de si e do seu bem-estar</p>
            <p style="font-size: 12px; margin-top: 8px;">Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getBookingReminderEmail = (data: BookingEmailData): string => {
  const pillarNames = {
    'saude_mental': 'Saúde Mental',
    'bem_estar_fisico': 'Bem-Estar Físico',
    'assistencia_financeira': 'Assistência Financeira',
    'assistencia_juridica': 'Assistência Jurídica'
  };

  const pillarName = pillarNames[data.pillar as keyof typeof pillarNames] || data.pillar;
  const meetingInfo = data.meetingType === 'virtual' && data.meetingLink
    ? `<p><strong>Link da Reunião:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`
    : '<p><strong>Tipo de Reunião:</strong> Telefónica</p>';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail { margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid #F59E0B; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Lembrete de Sessão</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.userName}</strong>,</p>
            <p>Esta é uma lembrança da sua sessão agendada para amanhã!</p>
            
            <div class="detail">
              <p><strong>Prestador:</strong> ${data.providerName}</p>
              <p><strong>Área:</strong> ${pillarName}</p>
              <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
              ${meetingInfo}
            </div>

            <p>Por favor, esteja disponível 5 minutos antes da hora marcada.</p>
            
            <a href="https://www.melhorsaúde.com/user/sessions" class="button">Ver Detalhes</a>
          </div>
          <div class="footer">
            <p>Melhor Saúde</p>
            <p>Cuidando de si e do seu bem-estar</p>
            <p style="font-size: 12px; margin-top: 8px;">Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
