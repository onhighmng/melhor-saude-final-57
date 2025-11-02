// Edge Function: Process Booking Reminders
// Sends pending booking reminder emails (to be called by cron job)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/auth.ts";
import { withErrorHandling, successResponse, logErrorToSentry } from "../_shared/errors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET') || 'your-secret-here';

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.includes(CRON_SECRET)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create admin Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get pending reminders
  const { data: reminders, error: fetchError } = await supabaseAdmin
    .rpc('get_pending_reminders', { p_limit: 100 });

  if (fetchError) {
    logErrorToSentry(new Error('Failed to fetch pending reminders'), { error: fetchError });
    throw new Error(`Failed to fetch reminders: ${fetchError.message}`);
  }

  if (!reminders || reminders.length === 0) {
    return successResponse({
      success: true,
      message: 'No pending reminders to process',
      processed: 0
    });
  }

  console.log(`Processing ${reminders.length} pending reminders`);

  let successCount = 0;
  let failureCount = 0;

  // Process each reminder
  for (const reminder of reminders) {
    try {
      // Format booking time
      const bookingDate = new Date(reminder.booking_date);
      const formattedDate = bookingDate.toLocaleDateString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Determine reminder message based on type
      const is24Hours = reminder.reminder_type === '24_hours';
      const timeUntil = is24Hours ? '24 horas' : '1 hora';
      const urgency = is24Hours ? '' : '🔔 ';

      // Send email via Resend
      if (RESEND_API_KEY) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Melhor Saúde <noreply@onhighmanagment.com>',
            to: [reminder.user_email],
            subject: `${urgency}Lembrete: Sessão em ${timeUntil}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>${urgency}Lembrete de Sessão</h2>
                <p>Olá ${reminder.user_name},</p>
                <p>Este é um lembrete de que tem uma sessão agendada em <strong>${timeUntil}</strong>.</p>

                <div style="margin: 30px 0; padding: 20px; background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 5px;">
                  <h3 style="margin-top: 0;">Detalhes da Sessão</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>📅 Data:</strong> ${formattedDate}</li>
                    <li><strong>🕒 Hora:</strong> ${reminder.booking_time}</li>
                    <li><strong>👨‍⚕️ Prestador:</strong> ${reminder.prestador_name}</li>
                    <li><strong>🎯 Área:</strong> ${reminder.pillar}</li>
                  </ul>
                </div>

                ${is24Hours ? `
                  <p>Sugestões para preparar a sua sessão:</p>
                  <ul>
                    <li>Reserve um espaço tranquilo e privado</li>
                    <li>Teste a sua câmara e microfone</li>
                    <li>Prepare quaisquer questões que queira discutir</li>
                    <li>Certifique-se de ter uma conexão de internet estável</li>
                  </ul>
                ` : `
                  <div style="margin: 20px 0; padding: 15px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 5px;">
                    <strong>⏰ A sua sessão começa em 1 hora!</strong><br>
                    Por favor, prepare-se para juntar-se à chamada.
                  </div>
                `}

                <div style="margin: 30px 0; text-align: center;">
                  <a href="${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/bookings/${reminder.booking_id}"
                     style="background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Ver Detalhes da Sessão
                  </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  Se precisar cancelar ou reagendar, por favor faça-o com antecedência.
                </p>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  Melhor Saúde - Plataforma de Bem-Estar<br>
                  Este é um email automático, por favor não responda.
                </p>
              </div>
            `
          })
        });

        if (emailResponse.ok) {
          // Mark reminder as sent
          await supabaseAdmin.rpc('mark_reminder_sent', {
            p_reminder_id: reminder.reminder_id,
            p_success: true
          });

          console.log(`Reminder sent successfully to ${reminder.user_email}`);
          successCount++;
        } else {
          const errorText = await emailResponse.text();
          console.error(`Failed to send reminder: ${errorText}`);

          // Mark reminder as failed
          await supabaseAdmin.rpc('mark_reminder_sent', {
            p_reminder_id: reminder.reminder_id,
            p_success: false,
            p_failure_reason: `Email API error: ${emailResponse.status}`
          });

          failureCount++;
        }
      } else {
        console.warn('RESEND_API_KEY not configured - would send reminder to:', reminder.user_email);

        // Mark as sent anyway in development
        await supabaseAdmin.rpc('mark_reminder_sent', {
          p_reminder_id: reminder.reminder_id,
          p_success: true
        });

        successCount++;
      }
    } catch (error) {
      console.error('Error processing reminder:', error);
      logErrorToSentry(error as Error, {
        reminder_id: reminder.reminder_id,
        user_email: reminder.user_email
      });

      // Mark reminder as failed
      await supabaseAdmin.rpc('mark_reminder_sent', {
        p_reminder_id: reminder.reminder_id,
        p_success: false,
        p_failure_reason: (error as Error).message
      });

      failureCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return successResponse({
    success: true,
    message: `Processed ${reminders.length} reminders`,
    processed: reminders.length,
    successful: successCount,
    failed: failureCount
  });
}

serve(withErrorHandling(handler));
