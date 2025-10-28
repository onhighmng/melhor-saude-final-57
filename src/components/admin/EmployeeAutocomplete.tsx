import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  user_id: string;
  name: string;
  email: string;
  company_name: string;
  sessions_allocated: number;
  sessions_used: number;
  sessions_remaining: number;
  company_id: string;
}

interface EmployeeAutocompleteProps {
  value?: string;
  onSelect: (employee: Employee | null) => void;
  companyId?: string;
}

export const EmployeeAutocomplete = ({ value, onSelect, companyId }: EmployeeAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
  }, [companyId]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('company_employees')
        .select(`
          user_id,
          sessions_allocated,
          sessions_used,
          company_id,
          profiles!inner(name, email),
          companies!inner(company_name)
        `)
        .eq('is_active', true);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedEmployees: Employee[] = (data || []).map((emp: any) => ({
        user_id: emp.user_id,
        name: emp.profiles.name || 'Unnamed',
        email: emp.profiles.email || '',
        company_name: emp.companies.company_name || '',
        sessions_allocated: emp.sessions_allocated,
        sessions_used: emp.sessions_used,
        sessions_remaining: emp.sessions_allocated - emp.sessions_used,
        company_id: emp.company_id,
      }));

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Erro ao carregar colaboradores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = employees.find((emp) => emp.user_id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedEmployee ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate">{selectedEmployee.name}</span>
              <span className="text-xs text-muted-foreground">
                ({selectedEmployee.sessions_remaining} sessões)
              </span>
            </div>
          ) : (
            'Selecionar colaborador...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Pesquisar por nome ou email..." />
          <CommandEmpty>
            {loading ? 'A carregar...' : 'Nenhum colaborador encontrado.'}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {employees.map((employee) => (
              <CommandItem
                key={employee.user_id}
                value={`${employee.name} ${employee.email}`}
                onSelect={() => {
                  onSelect(employee);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === employee.user_id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{employee.name}</span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        employee.sessions_remaining > 0
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {employee.sessions_remaining} sessões
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {employee.email} • {employee.company_name}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
