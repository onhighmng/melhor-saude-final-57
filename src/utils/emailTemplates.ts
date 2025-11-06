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
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 16.1px; } /* 14px × 1.15 */
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
            <p style="font-size: 13.8px; margin-top: 8px;">Este é um email automático, por favor não responda.</p> {/* 12px × 1.15 */}
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
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 16.1px; } /* 14px × 1.15 */
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
            <p style="font-size: 13.8px; margin-top: 8px;">Este é um email automático, por favor não responda.</p> {/* 12px × 1.15 */}
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
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 16.1px; } /* 14px × 1.15 */
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
            <p style="font-size: 13.8px; margin-top: 8px;">Este é um email automático, por favor não responda.</p> {/* 12px × 1.15 */}
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getMeetingLinkEmail = (data: BookingEmailData): string => {
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
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail { margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid #10B981; }
          .meeting-link-box { background-color: #D1FAE5; border: 2px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .meeting-link { font-size: 18.4px; color: #047857; word-break: break-all; } /* 16px × 1.15 */
          .button { display: inline-block; background-color: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: bold; }
          .button:hover { background-color: #059669; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 16.1px; } /* 14px × 1.15 */
          .important { background-color: #FEF3C7; border-left: 3px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Link da Sessão Disponível</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.userName}</strong>,</p>
            <p>Ótimas notícias! O link da sua sessão já está disponível. 🎉</p>
            
            <div class="detail">
              <p><strong>Prestador:</strong> ${data.providerName}</p>
              <p><strong>Área:</strong> ${pillarName}</p>
              <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
            </div>

            <div class="meeting-link-box">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #047857;">🔗 Link da Reunião Virtual</p>
              <p class="meeting-link"><a href="${data.meetingLink}" style="color: #047857;">${data.meetingLink}</a></p>
              <a href="${data.meetingLink}" class="button" target="_blank">Entrar na Sessão</a>
            </div>

            <div class="important">
              <p style="margin: 0; font-weight: bold; color: #92400E;">⏰ Lembrete Importante:</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400E;">
                <li>Por favor, esteja disponível <strong>5 minutos antes</strong> da hora marcada</li>
                <li>Teste o seu microfone e câmara antes da sessão</li>
                <li>Certifique-se de estar num ambiente calmo e privado</li>
                <li>Se tiver problemas técnicos, contacte o suporte</li>
              </ul>
            </div>

            <p style="margin-top: 25px; color: #6b7280;">Pode também aceder ao link através da plataforma, na sua lista de sessões.</p>
            
            <a href="https://www.melhorsaúde.com/user/sessions" style="color: #4F46E5; text-decoration: none;">Ver Minhas Sessões →</a>
          </div>
          <div class="footer">
            <p><strong>Melhor Saúde</strong></p>
            <p>Cuidando de si e do seu bem-estar</p>
            <p style="font-size: 13.8px; margin-top: 8px; color: #9ca3af;">Este é um email automático, por favor não responda.</p> {/* 12px × 1.15 */}
            <p style="font-size: 13.8px; margin-top: 4px; color: #9ca3af;">Se tiver questões, contacte-nos através da plataforma.</p> {/* 12px × 1.15 */}
          </div>
        </div>
      </body>
    </html>
  `;
};
