import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Calendar, Activity, Mail, Phone, Building2 } from 'lucide-react';

interface AdminCompanyFeaturesProps {
    company: {
        name: string;
        employees: number;
        totalSessions: number;
        usedSessions: number;
        plan: string;
        status: string;
        contactEmail?: string;
        contactPhone?: string;
    };
}

export function AdminCompanyFeatures({ company }: AdminCompanyFeaturesProps) {
    const usagePercent = Math.round((company.usedSessions / company.totalSessions) * 100);

    return (
        <section className="py-8">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto grid gap-2 sm:grid-cols-5">
                    {/* Company Overview Card */}
                    <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl">
                        <CardHeader>
                            <div className="md:p-6">
                                <p className="font-medium text-2xl">{company.name}</p>
                                <p className="text-muted-foreground mt-3 max-w-sm text-sm">Status: {company.status || 'Ativa'} | Plano: {company.plan || 'Professional'}</p>
                            </div>
                        </CardHeader>

                        <div className="relative h-fit pl-6 md:pl-12">
                            <div className="bg-background overflow-hidden rounded-tr-lg border-r border-t pr-2 pt-2 dark:bg-zinc-950">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-6 w-6 text-green-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Sessões</p>
                                            <p className="text-2xl font-bold">{company.usedSessions} / {company.totalSessions}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${usagePercent}%` }}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{usagePercent}% de utilização</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Contact Information Card */}
                    <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
                        <CardHeader>
                            <div className="md:p-6">
                                <p className="font-medium text-2xl">Contactos</p>
                                <p className="text-muted-foreground mt-3 max-w-sm text-sm">Informações de contacto da empresa</p>
                            </div>
                        </CardHeader>

                        <div className="relative h-fit pl-6 md:pl-12">
                            <div className="bg-background overflow-hidden rounded-tr-lg border-r border-t pr-2 pt-2 dark:bg-zinc-950">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-6 w-6 text-primary" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-muted-foreground">Colaboradores</p>
                                            <p className="text-xl font-bold">{company.employees} ativos</p>
                                        </div>
                                    </div>
                                    {company.contactEmail && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-6 w-6 text-blue-600" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="text-sm font-medium truncate">{company.contactEmail}</p>
                                            </div>
                                        </div>
                                    )}
                                    {company.contactPhone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-6 w-6 text-green-600" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-muted-foreground">Telefone</p>
                                                <p className="text-sm font-medium">{company.contactPhone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Bottom Card - Atividade de Sessões */}
                    <Card className="group p-6 shadow-black/5 sm:col-span-5 sm:rounded-none sm:rounded-bl-xl sm:rounded-br-xl md:p-12">
                        <p className="mx-auto mb-12 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl">Atividade de Sessões</p>

                        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-900">Sessões/Dia</p>
                                </div>
                                <p className="text-3xl font-bold text-blue-600">{Math.round(company.usedSessions / 30)}</p>
                                <p className="text-xs text-blue-700 mt-1">Média diária</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-5 w-5 text-green-600" />
                                    <p className="text-sm font-medium text-green-900">Taxa de Utilização</p>
                                </div>
                                <p className="text-3xl font-bold text-green-600">{usagePercent}%</p>
                                <p className="text-xs text-green-700 mt-1">Do total alocado</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    <p className="text-sm font-medium text-purple-900">Disponíveis</p>
                                </div>
                                <p className="text-3xl font-bold text-purple-600">{company.totalSessions - company.usedSessions}</p>
                                <p className="text-xs text-purple-700 mt-1">Sessões restantes</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
