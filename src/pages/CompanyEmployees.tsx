import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserPlus, Users, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { mockCompanies, CompanyUser, deactivateUser, activateUser } from "@/data/companyMockData";
import { SeatUsageCard } from "@/components/company/SeatUsageCard";
import { InviteEmployeeButton } from "@/components/company/InviteEmployeeButton";
import { InviteEmployeeModal } from "@/components/company/InviteEmployeeModal";
import { DeactivateUserDialog } from "@/components/company/ConfirmationDialogs/DeactivateUserDialog";
import { companyUIcopy } from "@/data/companyUIcopy";
import { companyToasts } from "@/data/companyToastMessages";

export default function CompanyEmployees() {
  const [company, setCompany] = useState(mockCompanies[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: '',
    userName: ''
  });

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

  const handleDeactivateUser = (userId: string, userName: string) => {
    setDeactivateDialog({ open: true, userId, userName });
  };

  const confirmDeactivateUser = () => {
    const updatedCompany = deactivateUser(company, deactivateDialog.userId);
    setCompany(updatedCompany);
    companyToasts.employeeDeactivated();
    setDeactivateDialog({ open: false, userId: '', userName: '' });
  };

  const handleActivateUser = (userId: string) => {
    if (company.isAtSeatLimit) {
      companyToasts.employeeActivationBlocked();
      return;
    }

    const updatedCompany = activateUser(company, userId);
    setCompany(updatedCompany);
    companyToasts.employeeActivated();
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
                    {filterStatus === 'all' ? companyUIcopy.employees.filters.all : 
                     filterStatus === 'active' ? companyUIcopy.employees.filters.viewActive : companyUIcopy.employees.filters.viewInactive}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    {companyUIcopy.employees.filters.all}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    {companyUIcopy.employees.filters.viewActive}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                    {companyUIcopy.employees.filters.viewInactive}
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
                          {user.role === 'hr' ? companyUIcopy.employees.roles.hr : companyUIcopy.employees.roles.employee}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{user.usedQuota} / {user.companyQuota}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {companyUIcopy.employees.quotaTooltip(user.usedQuota, user.companyQuota)}
                          </TooltipContent>
                        </Tooltip>
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
                            <DropdownMenuItem asChild>
                              <Link to={`/company/employees/${user.id}`}>
                                {companyUIcopy.employees.actions.viewDetails}
                              </Link>
                            </DropdownMenuItem>
                            {user.isActive ? (
                              <DropdownMenuItem 
                                onClick={() => handleDeactivateUser(user.id, user.name)}
                                className="text-red-600"
                              >
                                {companyUIcopy.employees.actions.deactivate}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleActivateUser(user.id)}
                                disabled={company.isAtSeatLimit}
                              >
                                {companyUIcopy.employees.actions.activate}
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

      <DeactivateUserDialog
        open={deactivateDialog.open}
        onOpenChange={(open) => !open && setDeactivateDialog({ open: false, userId: '', userName: '' })}
        onConfirm={confirmDeactivateUser}
        userName={deactivateDialog.userName}
      />
    </div>
  );
}