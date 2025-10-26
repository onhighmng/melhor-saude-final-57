import { Card, CardHeader } from '@/components/ui/card';
import { Users, Calendar, Activity, TrendingUp, Star, Building, DollarSign, Clock, Scale } from 'lucide-react';

interface ProviderFeaturesProps {
    provider: {
        id: string;
        name: string;
        specialty: string;
        email: string;
        pillar: string;
        status: string;
        totalSessions: number;
        satisfaction: number;
        sessionsThisMonth: number;
        companiesServed: number;
        costPerSession: number;
        platformMargin: number;
        monthlyPayment: number;
        sessionType: string;
    };
}

export function ProviderFeatures({ provider }: ProviderFeaturesProps) {
    const netPayment = provider.costPerSession * (100 - provider.platformMargin) / 100;
    const platformEarnings = provider.costPerSession * provider.platformMargin / 100;

    return (
        <>
            <section className="py-8">
                <div className="mx-auto max-w-[95%] px-6">
                    <div className="mx-auto grid gap-2 sm:grid-cols-5">
                        {/* Provider Overview Card */}
                        <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl">
                            <CardHeader>
                                <div className="md:p-6">
                                    <p className="font-medium text-3xl">{provider.name}</p>
                                    <p className="text-muted-foreground mt-3 max-w-sm text-base">{provider.specialty} • {provider.status}</p>
                                </div>
                            </CardHeader>

                            <div className="relative h-fit pl-6 md:pl-12">
                                <div className="bg-background overflow-hidden rounded-tr-lg border-r border-t pr-2 pt-2 dark:bg-zinc-950">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-7 w-7 text-green-600" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Sessões Totais</p>
                                                <p className="text-3xl font-bold">{provider.totalSessions}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Star className="h-7 w-7 text-yellow-600" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Satisfação</p>
                                                <p className="text-3xl font-bold">{provider.satisfaction}/10</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(provider.satisfaction / 10) * 100}%` }}></div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{provider.satisfaction}/10 de satisfação</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Financial Overview Card */}
                        <Card className="group shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
                            <CardHeader>
                                <div className="md:p-6">
                                    <p className="font-medium text-3xl">Informação Financeira</p>
                                    <p className="text-muted-foreground mt-3 max-w-sm text-base">Custos e pagamentos do prestador</p>
                                </div>
                            </CardHeader>

                            <div className="relative h-fit pl-6 md:pl-12">
                                <div className="bg-background overflow-hidden rounded-tr-lg border-r border-t pr-2 pt-2 dark:bg-zinc-950">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <DollarSign className="h-7 w-7 text-primary" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Custo por Sessão</p>
                                                <p className="text-3xl font-bold">{provider.costPerSession} MZN</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <TrendingUp className="h-7 w-7 text-green-600" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Pagamento Líquido</p>
                                                <p className="text-3xl font-bold">{netPayment.toFixed(2)} MZN</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Building className="h-7 w-7 text-orange-600" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Este Mês</p>
                                                <p className="text-3xl font-bold">{provider.monthlyPayment.toFixed(2)} MZN</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Performance Metrics Card */}
                        <Card className="group p-6 shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-bl-xl md:p-12">
                            <p className="mx-auto mb-12 max-w-md text-balance text-center text-xl font-semibold sm:text-3xl">Métricas de Desempenho</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                        <p className="text-base font-medium text-blue-900">Sessões/Mês</p>
                                    </div>
                                    <p className="text-4xl font-bold text-blue-600">{provider.sessionsThisMonth}</p>
                                    <p className="text-sm text-blue-700 mt-1">Este mês</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building className="h-6 w-6 text-green-600" />
                                        <p className="text-base font-medium text-green-900">Empresas</p>
                                    </div>
                                    <p className="text-4xl font-bold text-green-600">{provider.companiesServed}</p>
                                    <p className="text-sm text-green-700 mt-1">Atendidas</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="h-6 w-6 text-purple-600" />
                                        <p className="text-base font-medium text-purple-900">Margem</p>
                                    </div>
                                    <p className="text-4xl font-bold text-purple-600">{provider.platformMargin}%</p>
                                    <p className="text-sm text-purple-700 mt-1">Plataforma</p>
                                </div>
                            </div>
                        </Card>

                        {/* Platform Earnings Card */}
                        <Card className="group shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-br-xl">
                            <CardHeader>
                                <div className="md:p-6">
                                    <p className="font-medium text-3xl">Receitas da Plataforma</p>
                                    <p className="text-muted-foreground mt-3 max-w-sm text-base">Margem e ganhos por sessão</p>
                                </div>
                            </CardHeader>

                            <div className="relative h-fit pl-6 md:pl-12">
                                <div className="bg-background overflow-hidden rounded-br-lg border-r border-b pr-2 pb-2 dark:bg-zinc-950">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <Scale className="h-7 w-7 text-purple-600" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Margem por Sessão</p>
                                                <p className="text-3xl font-bold">{platformEarnings.toFixed(2)} MZN</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <TrendingUp className="h-7 w-7 text-green-600" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Percentagem</p>
                                                <p className="text-3xl font-bold">{provider.platformMargin}%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="h-7 w-7 text-blue-600" />
                                            <div>
                                                <p className="text-base text-muted-foreground">Total Mensal</p>
                                                <p className="text-3xl font-bold">{(platformEarnings * provider.sessionsThisMonth).toFixed(2)} MZN</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>
        </>
    );
}
