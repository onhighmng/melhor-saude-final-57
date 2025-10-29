import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeInput } from '@/utils/sanitize';

export default function CompanySettings() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: ''
  });

  useEffect(() => {
    loadCompanyData();
  }, [profile?.company_id]);

  const loadCompanyData = async () => {
    if (!profile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('company_name, contact_email, contact_phone')
        .eq('id', profile.company_id)
        .single();
      
      if (data) setCompanyData(data);
    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Sanitize all text inputs before saving
      const sanitizedData = {
        company_name: sanitizeInput(companyData.company_name),
        contact_email: sanitizeInput(companyData.contact_email),
        contact_phone: sanitizeInput(companyData.contact_phone)
      };

      const { error } = await supabase
        .from('companies')
        .update(sanitizedData)
        .eq('id', profile?.company_id);
      
      if (error) throw error;
      
      toast.success('Definições guardadas com sucesso');
    } catch (error) {
      toast.error('Erro ao guardar definições');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Definições da Empresa</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informação da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome da Empresa</Label>
            <Input
              value={companyData.company_name}
              onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})}
            />
          </div>
          <div>
            <Label>Email de Contacto</Label>
            <Input
              type="email"
              value={companyData.contact_email}
              onChange={(e) => setCompanyData({...companyData, contact_email: e.target.value})}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={companyData.contact_phone}
              onChange={(e) => setCompanyData({...companyData, contact_phone: e.target.value})}
            />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'A guardar...' : 'Guardar Alterações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

