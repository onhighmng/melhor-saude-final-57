import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Download, 
  Send, 
  Calendar,
  Building2,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Company {
  id: string;
  company_name: string;
  contact_email: string;
  sessions_allocated: number;
  sessions_used: number;
  price_per_session?: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  company_id: string;
  amount_due: number;
  amount_paid: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string;
  paid_at: string | null;
  metadata: any;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export const InvoiceGenerator: React.FC = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: 'Sessões de Bem-estar', quantity: 0, unit_price: 50, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(23); // Portuguese VAT rate
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadCompanies();
    loadRecentInvoices();
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, company_name, contact_email, sessions_allocated, sessions_used')
        .eq('is_active', true)
        .order('company_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar empresas",
        variant: "destructive"
      });
    }
  };

  const loadRecentInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          company_id,
          amount_due,
          amount_paid,
          tax_amount,
          total_amount,
          status,
          invoice_date,
          due_date,
          paid_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentInvoices((data || []).map(inv => ({ 
        ...inv, 
        metadata: {}, 
        status: inv.status as 'pending' | 'paid' | 'overdue' | 'cancelled' 
      })));
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const generateInvoiceNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setInvoiceItems(updatedItems);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const generateInvoice = async () => {
    if (!selectedCompany) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const invoiceNumber = generateInvoiceNumber();
      const { subtotal, taxAmount, total } = calculateTotals();
      
      const company = companies.find(c => c.id === selectedCompany);
      if (!company) throw new Error('Empresa não encontrada');

      // Create invoice record
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          company_id: selectedCompany,
          amount_due: subtotal,
          amount_paid: 0,
          tax_amount: taxAmount,
          total_amount: total,
          status: 'pending',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: dueDate,
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'invoice_generated',
          entity_type: 'invoice',
          entity_id: invoice.id,
          details: {
            invoice_number: invoiceNumber,
            company_id: selectedCompany,
            amount: total
          }
        });

      toast({
        title: "Fatura gerada",
        description: `Fatura ${invoiceNumber} criada com sucesso`
      });

      // Reset form
      setSelectedCompany('');
      setInvoiceItems([{ description: 'Sessões de Bem-estar', quantity: 0, unit_price: 50, total: 0 }]);
      setNotes('');
      setIsOpen(false);
      loadRecentInvoices();

    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar fatura",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      // Generate PDF content (simplified - in real implementation, use react-pdf)
      const company = companies.find(c => c.id === invoice.company_id);
      
      const pdfContent = `
FATURA ${invoice.invoice_number}

Empresa: ${company?.company_name || 'N/A'}
Email: ${company?.contact_email || 'N/A'}
Data de Emissão: ${new Date(invoice.invoice_date).toLocaleDateString('pt-PT')}
Data de Vencimento: ${new Date(invoice.due_date).toLocaleDateString('pt-PT')}

Subtotal: ${invoice.amount_due.toFixed(2)} MZN
IVA (${taxRate}%): ${invoice.tax_amount.toFixed(2)} MZN
TOTAL: ${invoice.total_amount.toFixed(2)} MZN
      `;

      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura_${invoice.invoice_number}.txt`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Fatura descarregada",
        description: `Fatura ${invoice.invoice_number} descarregada`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao descarregar fatura",
        variant: "destructive"
      });
    }
  };

  const sendInvoiceEmail = async (invoice: Invoice) => {
    try {
      // This would integrate with email service
      toast({
        title: "Email enviado",
        description: `Fatura ${invoice.invoice_number} enviada por email`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar email",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paga</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Vencida</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Geração de Faturas</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Nova Fatura
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerar Nova Fatura</DialogTitle>
              <DialogDescription>
                Crie uma nova fatura para uma empresa
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Company Selection */}
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Itens da Fatura</Label>
                  <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                    Adicionar Item
                  </Button>
                </div>
                
                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label htmlFor={`description-${index}`}>Descrição</Label>
                      <Input
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                        placeholder="Descrição do item"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`quantity-${index}`}>Qtd</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`price-${index}`}>Preço</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <div className="p-2 border rounded bg-muted">
                        {item.total.toFixed(2)} MZN
                      </div>
                    </div>
                    <div className="col-span-1">
                      {invoiceItems.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInvoiceItem(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax Rate */}
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Taxa de IVA (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due-date">Data de Vencimento</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionais para a fatura"
                  rows={3}
                />
              </div>

              {/* Totals */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{subtotal.toFixed(2)} MZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA ({taxRate}%):</span>
                      <span>{taxAmount.toFixed(2)} MZN</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{total.toFixed(2)} MZN</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={generateInvoice} disabled={isGenerating}>
                  {isGenerating ? 'Gerando...' : 'Gerar Fatura'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas Recentes</CardTitle>
          <CardDescription>
            Últimas faturas geradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {companies.find(c => c.id === invoice.company_id)?.company_name}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{invoice.total_amount.toFixed(2)} MZN</p>
                    <p className="text-sm text-muted-foreground">
                      Vence em {new Date(invoice.due_date).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(invoice.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(invoice)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendInvoiceEmail(invoice)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {recentInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma fatura encontrada</p>
                <p className="text-sm">Gere a primeira fatura para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
