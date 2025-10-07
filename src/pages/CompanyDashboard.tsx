import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Calendar, Building2 } from "lucide-react";
import { mockCompanies } from "@/data/companyMockData";
import { SeatUsageCard } from "@/components/company/SeatUsageCard";
import { InviteEmployeeButton } from "@/components/company/InviteEmployeeButton";
import { InviteEmployeeModal } from "@/components/company/InviteEmployeeModal";
import { companyToasts } from "@/data/companyToastMessages";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation('company');
  const [company] = useState(mockCompanies[0]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInviteEmployee = () => {
    setShowInviteModal(true);
  };

  const handleViewMonthlyReport = () => {
    navigate('/company/reports');
  };

  const handleExportData = () => {
    const data = {
      company: company.name,
      activeEmployees: company.seatUsed,
      totalSeats: company.seatLimit,
      plan: company.planType,
      exportDate: new Date().toISOString()
    };
    
    const csv = [
      [t('dashboard.export.metric'), t('dashboard.export.value')].join(','),
      [t('dashboard.export.company'), data.company].join(','),
      [t('dashboard.export.activeEmployees'), data.activeEmployees].join(','),
      [t('dashboard.export.totalSeats'), data.totalSeats].join(','),
      [t('dashboard.export.plan'), data.plan].join(','),
      [t('dashboard.export.exportDate'), data.exportDate].join(',')
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_empresa_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    companyToasts.dataExported();
  };

  const handleConfigureNotifications = () => {
    navigate('/company/settings');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
          </div>
          
          <InviteEmployeeButton company={company} onInvite={handleInviteEmployee} />
        </div>

        {/* Seat Usage Card */}
        <SeatUsageCard company={company} />

        {/* Main Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Employees */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.metrics.activeEmployees')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.seatUsed}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.metrics.ofAccounts', { count: company.seatLimit })}
              </p>
            </CardContent>
          </Card>

          {/* Total Sessions Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.metrics.sessionsUsed')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.metrics.sinceLastMonth', { percent: 12 })}
              </p>
            </CardContent>
          </Card>

          {/* Adoption Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.metrics.adoptionRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.metrics.employeesWithSession')}
              </p>
            </CardContent>
          </Card>

          {/* Plan Type */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.metrics.currentPlan')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{company.planType}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.metrics.accountsIncluded', { count: company.seatLimit })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleViewMonthlyReport}>
                {t('dashboard.quickActions.viewReport')}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                {t('dashboard.quickActions.exportData')}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleConfigureNotifications}>
                {t('dashboard.quickActions.configureNotifications')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.upcomingEvents.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.upcomingEvents.mentalWellness')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.upcomingEvents.mindfulness')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.upcomingEvents.financial')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InviteEmployeeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        company={company}
        onInviteSuccess={() => {
          companyToasts.employeeInvited();
          setShowInviteModal(false);
        }}
      />
    </div>
  );
}