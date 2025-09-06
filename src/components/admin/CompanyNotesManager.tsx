import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Edit2, Check, X, Building } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  company_name: string;
  contact_email: string;
  plan_type: string;
  is_active: boolean;
  final_notes: string | null;
  total_employees: number;
  active_users: number;
}

const CompanyNotesManager = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // Get companies with actual user counts from profiles table
      const { data: companiesData, error: companiesError } = await supabase
        .from('company_organizations')
        .select('*')
        .eq('is_active', true)
        .order('company_name');

      if (companiesError) throw companiesError;

      // Get actual user counts for each company
      const companiesWithUserCounts = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: userCounts, error: userError } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('company', company.company_name);

          if (userError) {
            console.error('Error fetching user counts for', company.company_name, userError);
            return {
              ...company,
              total_employees: company.total_employees || 0,
              active_users: company.active_users || 0
            };
          }

          const totalUsers = userCounts?.length || 0;
          const activeUsers = userCounts?.filter(user => user.is_active).length || 0;

          return {
            ...company,
            total_employees: totalUsers,
            active_users: activeUsers
          };
        })
      );

      setCompanies(companiesWithUserCounts);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro ao carregar empresas",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (company: Company) => {
    setEditingCompany(company.id);
    setEditingNotes(company.final_notes || '');
  };

  const handleCancelEditing = () => {
    setEditingCompany(null);
    setEditingNotes('');
  };

  const handleSaveNotes = async (companyId: string) => {
    setSaving(companyId);
    try {
      const { error } = await supabase
        .from('company_organizations')
        .update({ 
          final_notes: editingNotes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, final_notes: editingNotes.trim() || null }
          : company
      ));

      setEditingCompany(null);
      setEditingNotes('');
      
      toast({
        title: "Observações atualizadas!",
        description: "As observações finais foram guardadas com sucesso."
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erro ao guardar observações",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-grey">A carregar empresas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold text-navy-blue">Gestão de Observações Finais</h2>
          <p className="text-slate-grey">Gerir observações finais para relatórios mensais de cada empresa</p>
        </div>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="w-12 h-12 text-slate-grey mx-auto mb-4" />
            <p className="text-slate-grey">Nenhuma empresa encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl text-navy-blue">{company.company_name}</CardTitle>
                    <Badge variant={company.plan_type === 'enterprise' ? 'default' : 'secondary'}>
                      {company.plan_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-grey">
                    <span>{company.active_users}/{company.total_employees} utilizadores ativos</span>
                  </div>
                </div>
                <p className="text-sm text-slate-grey">{company.contact_email}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-navy-blue">Observações Finais</h4>
                    {editingCompany !== company.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEditing(company)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        {company.final_notes ? 'Editar' : 'Adicionar'}
                      </Button>
                    )}
                  </div>

                  {editingCompany === company.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Insira as observações finais para esta empresa..."
                        className="min-h-[120px] resize-none"
                        maxLength={1000}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-grey">
                          {editingNotes.length}/1000 caracteres
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditing}
                            disabled={saving === company.id}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(company.id)}
                            disabled={saving === company.id}
                            className="flex items-center gap-2"
                          >
                            {saving === company.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Guardar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-soft-white/50 rounded-lg p-4 min-h-[80px] border border-soft-white">
                      {company.final_notes ? (
                        <p className="text-slate-grey whitespace-pre-wrap">{company.final_notes}</p>
                      ) : (
                        <p className="text-slate-grey/60 italic">Nenhuma observação adicionada</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyNotesManager;