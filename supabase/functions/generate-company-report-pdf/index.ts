import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id, start_date, end_date } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get metrics via RPC
    const { data: metrics, error } = await supabaseClient
      .rpc('get_company_monthly_metrics', {
        p_company_id: company_id,
        p_start_date: start_date,
        p_end_date: end_date
      });

    if (error) throw error;

    // Create PDF
    const doc = new jsPDF();
    
    // Title and header
    doc.setFontSize(20);
    doc.text('Relatório Mensal - Melhor Saúde', 20, 20);
    
    doc.setFontSize(14);
    doc.text(metrics.company_name, 20, 30);
    doc.setFontSize(10);
    doc.text(`Período: ${start_date} a ${end_date}`, 20, 36);
    
    // Subscription section
    doc.setFontSize(12);
    doc.text('Subscrição', 20, 50);
    doc.setFontSize(10);
    doc.text(`Lugares: ${metrics.subscription.employee_seats}`, 20, 58);
    doc.text(`Sessões Alocadas: ${metrics.subscription.sessions_allocated}`, 20, 64);
    doc.text(`Sessões Utilizadas (Total): ${metrics.subscription.sessions_used}`, 20, 70);
    doc.text(`Sessões Utilizadas (Período): ${metrics.subscription.period_sessions_used}`, 20, 76);
    doc.text(`Taxa de Utilização: ${metrics.subscription.utilization_rate}%`, 20, 82);
    
    // Employees section
    doc.setFontSize(12);
    doc.text('Colaboradores', 20, 96);
    doc.setFontSize(10);
    doc.text(`Ativos: ${metrics.employees.active}`, 20, 104);
    doc.text(`Convites Pendentes: ${metrics.employees.pending_invites}`, 20, 110);
    doc.text(`Lugares Disponíveis: ${metrics.employees.seats_available}`, 20, 116);
    
    // Pillar breakdown
    doc.setFontSize(12);
    doc.text('Distribuição por Pilar', 20, 130);
    let yPos = 138;
    if (metrics.pillar_breakdown && metrics.pillar_breakdown.length > 0) {
      metrics.pillar_breakdown.forEach((p: any) => {
        doc.setFontSize(10);
        doc.text(`${p.pillar}: ${p.sessions} sessões (${p.percentage}%)`, 20, yPos);
        yPos += 6;
      });
    } else {
      doc.setFontSize(10);
      doc.text('Nenhuma sessão registrada no período', 20, yPos);
      yPos += 6;
    }
    
    // Top pillar
    doc.setFontSize(12);
    doc.text('Pilar Mais Utilizado', 20, yPos + 8);
    doc.setFontSize(10);
    doc.text(`${metrics.top_pillar.name}: ${metrics.top_pillar.sessions} sessões`, 20, yPos + 16);
    
    // Satisfaction
    doc.setFontSize(12);
    doc.text('Satisfação', 20, yPos + 30);
    doc.setFontSize(10);
    doc.text(`Avaliação Média: ${metrics.satisfaction.avg_rating}/10`, 20, yPos + 38);
    doc.text(`Sessões Avaliadas: ${metrics.satisfaction.rated_sessions}`, 20, yPos + 44);
    doc.text(`Alta Satisfação (≥8): ${metrics.satisfaction.high_satisfaction_count}`, 20, yPos + 50);
    doc.text(`Taxa de Satisfação: ${metrics.satisfaction.satisfaction_rate}%`, 20, yPos + 56);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 20, 280);
    doc.text('Melhor Saúde - Plataforma de Bem-Estar Corporativo', 20, 285);
    
    // Generate PDF as base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    return new Response(
      JSON.stringify({ 
        pdf: pdfBase64,
        filename: `relatorio_${metrics.company_name.replace(/\s+/g, '_')}_${start_date}_${end_date}.pdf`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

