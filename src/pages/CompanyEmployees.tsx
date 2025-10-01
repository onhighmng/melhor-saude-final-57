import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserPlus, Users, Filter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { mockCompanies, CompanyUser, deactivateUser, activateUser } from "@/data/companyMockData";
import { SeatUsageCard } from "@/components/company/SeatUsageCard";
import { InviteEmployeeButton } from "@/components/company/InviteEmployeeButton";
import { InviteEmployeeModal } from "@/components/company/InviteEmployeeModal";

export default function CompanyEmployees() {
  const { toast } = useToast();
  const [company, setCompany] = useState(mockCompanies[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredUsers = company.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleInviteEmployee = () => {
    setShowInviteModal(true);
  };

  const handleInviteSuccess = (newUser: CompanyUser) => {
    const updatedCompany = {
      ...company,
      users: [...company.users, newUser],
      seatAvailable: company.seatAvailable - 1,
      isAtSeatLimit: company.seatAvailable - 1 === 0
    };
    setCompany(updatedCompany);
  };

  const handleDeactivateUser = (userId: string) => {
    const updatedCompany = deactivateUser(company, userId);
    setCompany(updatedCompany);
    toast({
      title: "Colaborador desativado",
      description: "A conta foi desativada e libertou uma vaga."
    });
  };

  const handleActivateUser = (userId: string) => {
    if (company.isAtSeatLimit) {
      toast({
        title: "Não é possível ativar",
        description: "Limite de contas atingido. Desative outras contas primeiro.",
        variant: "destructive"
      });
      return;
    }

    const updatedCompany = activateUser(company, userId);
    setCompany(updatedCompany);
    toast({
      title: "Colaborador ativado",
      description: "A conta foi ativada com sucesso."
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Colaboradores</h1>
            <p className="text-muted-foreground">
              Gestão de contas e colaboradores da empresa
            </p>
          </div>
          
          <InviteEmployeeButton company={company} onInvite={handleInviteEmployee} />
        </div>

        {/* Seat Usage Card */}
        <SeatUsageCard company={company} />

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Colaboradores</CardTitle>
            <CardDescription>
              {filteredUsers.length} de {company.users.length} colaboradores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Pesquisar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    {filterStatus === 'all' ? 'Todos' : 
                     filterStatus === 'active' ? 'Ativos' : 'Inativos'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    Ativos apenas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                    Inativos apenas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Quota Utilizada</TableHead>
                    <TableHead>Data de Adesão</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'hr' ? 'default' : 'secondary'}>
                          {user.role === 'hr' ? 'RH' : 'Colaborador'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.usedQuota} / {user.companyQuota}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.joinedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              toast({
                                title: "Detalhes do Colaborador",
                                description: `${user.name} - ${user.email}. Quota: ${user.usedQuota}/${user.companyQuota}`,
                              });
                            }}>
                              Ver Detalhes
                            </DropdownMenuItem>
                            {user.isActive ? (
                              <DropdownMenuItem 
                                onClick={() => handleDeactivateUser(user.id)}
                                className="text-red-600"
                              >
                                Desativar Conta
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleActivateUser(user.id)}
                                disabled={company.isAtSeatLimit}
                              >
                                Ativar Conta
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum colaborador encontrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <InviteEmployeeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        company={company}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}