import { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Mail, Phone, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  status: string;
}

export function MobileCompanyEmployees() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, status')
        .eq('company_id', profile.company_id)
        .eq('role', 'user');

      if (!error && data) {
        setEmployees(data as Employee[]);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, [profile?.company_id]);

  const filteredEmployees = employees.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingAnimation variant="fullscreen" message="A carregar colaboradores..." showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Colaboradores</h1>
              <p className="text-gray-500 text-sm">Gerir equipa da empresa</p>
            </div>
            <button 
              onClick={() => navigate('/company/colaboradores/add')}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Procurar colaboradores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-blue-50 rounded-2xl p-4 border-none text-center">
            <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none text-center">
            <p className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.status === 'active').length}
            </p>
            <p className="text-xs text-gray-600">Ativos</p>
          </Card>
          <Card className="bg-gray-100 rounded-2xl p-4 border-none text-center">
            <p className="text-2xl font-bold text-gray-600">
              {employees.filter(e => e.status === 'inactive').length}
            </p>
            <p className="text-xs text-gray-600">Inativos</p>
          </Card>
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">A carregar...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum colaborador encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <Card 
                key={employee.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer"
                onClick={() => navigate(`/company/colaboradores/${employee.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-medium truncate">{employee.full_name}</h3>
                    <p className="text-gray-500 text-sm truncate">{employee.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={employee.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}

