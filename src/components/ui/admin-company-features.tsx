import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';

interface AdminCompanyFeaturesProps {
    company: {
        name: string;
        employees: number;
        totalSessions: number;
        usedSessions: number;
        plan: string;
        status: string;
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

                    {/* Affiliates Card */}
                    <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
                        <CardHeader>
                            <div className="md:p-6">
                                <p className="font-medium text-2xl">Afiliados</p>
                                <p className="text-muted-foreground mt-3 max-w-sm text-sm">Gestão de parceiros e afiliados</p>
                            </div>
                        </CardHeader>

                        <div className="relative h-fit pl-6 md:pl-12">
                            <div className="bg-background overflow-hidden rounded-tr-lg border-r border-t pr-2 pt-2 dark:bg-zinc-950">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-6 w-6 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total de afiliados</p>
                                            <p className="text-2xl font-bold">12</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-6 w-6 text-green-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ativos</p>
                                            <p className="text-2xl font-bold">8</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-6 w-6 text-orange-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Comissões</p>
                                            <p className="text-2xl font-bold">€2,450</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Bottom Card - Atividade de Sessões */}
                    <Card className="group p-6 shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-12">
                        <p className="mx-auto mb-12 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl">Atividade de Sessões</p>

                        <div className="grid grid-cols-3 gap-4">
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
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <p className="text-sm font-medium text-green-900">Taxa de Utilização</p>
                                </div>
                                <p className="text-3xl font-bold text-green-600">{usagePercent}%</p>
                                <p className="text-xs text-green-700 mt-1">Sessões ativas</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    <p className="text-sm font-medium text-purple-900">Disponíveis</p>
                                </div>
                                <p className="text-3xl font-bold text-purple-600">{company.totalSessions - company.usedSessions}</p>
                                <p className="text-xs text-purple-700 mt-1">Restantes</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl">
                        <CardHeader className="p-6 md:p-12">
                            <p className="font-medium">Colaboradores</p>
                            <p className="text-muted-foreground mt-2 max-w-sm text-sm">Total de funcionários ativos na plataforma</p>
                        </CardHeader>
                        <CardContent className="relative h-fit px-6 pb-6 md:px-12 md:pb-12">
                            <div className="flex items-center justify-center p-8">
                                <div className="text-center">
                                    <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                                    <p className="text-5xl font-bold text-primary">{company.employees}</p>
                                    <p className="text-sm text-muted-foreground mt-2">Colaboradores registados</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
