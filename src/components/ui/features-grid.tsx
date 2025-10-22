import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Brain, Heart, DollarSign, Scale, Users, TrendingUp } from 'lucide-react'

export function FeaturesGrid() {
    return (
        <section className="bg-background py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto grid gap-2 sm:grid-cols-5">
                    <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl hover-lift">
                        <CardHeader>
                            <div className="md:p-6">
                                <p className="font-semibold text-2xl text-foreground">Gestão Centralizada de Colaboradores</p>
                                <p className="text-muted-foreground mt-3 max-w-sm text-base">
                                    Plataforma completa para gerir todos os aspectos do bem-estar dos seus colaboradores em tempo real.
                                </p>
                            </div>
                        </CardHeader>

                        <div className="relative h-fit pl-6 md:pl-12">
                            <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,hsl(var(--background))_100%)]"></div>

                            <div className="bg-card overflow-hidden rounded-tl-lg border-l border-t pl-2 pt-2">
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <Brain className="h-8 w-8 text-blue-600 mb-2" />
                                            <p className="font-semibold text-foreground">Saúde Mental</p>
                                            <p className="text-2xl font-bold text-blue-600">456</p>
                                            <p className="text-xs text-muted-foreground">Sessões ativas</p>
                                        </div>
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <Heart className="h-8 w-8 text-yellow-600 mb-2" />
                                            <p className="font-semibold text-foreground">Bem-Estar Físico</p>
                                            <p className="text-2xl font-bold text-yellow-600">328</p>
                                            <p className="text-xs text-muted-foreground">Sessões ativas</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                                            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                                            <p className="font-semibold text-foreground">Assistência Financeira</p>
                                            <p className="text-2xl font-bold text-green-600">189</p>
                                            <p className="text-xs text-muted-foreground">Sessões ativas</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <Scale className="h-8 w-8 text-purple-600 mb-2" />
                                            <p className="font-semibold text-foreground">Assistência Jurídica</p>
                                            <p className="text-2xl font-bold text-purple-600">142</p>
                                            <p className="text-xs text-muted-foreground">Sessões ativas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl hover-lift">
                        <p className="mx-auto my-6 max-w-md text-balance px-6 text-center text-lg font-semibold sm:text-2xl md:p-6">
                            Monitorização em Tempo Real
                        </p>

                        <CardContent className="mt-auto h-fit">
                            <div className="relative mb-6 sm:mb-0">
                                <div className="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                                <div className="overflow-hidden rounded-r-lg border bg-card p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <span className="text-sm text-muted-foreground">Taxa de Participação</span>
                                            <span className="text-2xl font-bold text-primary">87%</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <span className="text-sm text-muted-foreground">Satisfação Média</span>
                                            <span className="text-2xl font-bold text-emerald-600">4.8/5</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <span className="text-sm text-muted-foreground">Colaboradores Ativos</span>
                                            <span className="text-2xl font-bold text-amber-600">1,234</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group p-6 shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-12 hover-lift">
                        <p className="mx-auto mb-12 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl">
                            Acesso Rápido e Intuitivo
                        </p>

                        <div className="flex justify-center gap-6">
                            <div className="bg-muted/35 relative flex aspect-square size-20 items-center rounded-lg border p-4 shadow-lg">
                                <Users className="mt-auto size-8 text-primary" />
                            </div>
                            <div className="bg-muted/35 flex aspect-square size-20 items-center justify-center rounded-lg border p-4 shadow-lg">
                                <TrendingUp className="size-8 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Interface otimizada para gestão eficiente
                        </p>
                    </Card>

                    <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl hover-lift">
                        <CardHeader className="p-6 md:p-12">
                            <p className="font-semibold text-xl text-foreground">Pilares de Bem-Estar Integrados</p>
                            <p className="text-muted-foreground mt-2 max-w-sm text-base">
                                Todos os serviços disponíveis numa única plataforma centralizada.
                            </p>
                        </CardHeader>
                        <CardContent className="relative h-fit px-6 pb-6 md:px-12 md:pb-12">
                            <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
                                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 flex aspect-square items-center justify-center border border-blue-200 dark:border-blue-800 p-4">
                                    <Brain className="size-8 text-blue-600" />
                                </div>
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex aspect-square items-center justify-center border border-yellow-200 dark:border-yellow-800 p-4">
                                    <Heart className="size-8 text-yellow-600" />
                                </div>
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 flex aspect-square items-center justify-center border border-green-200 dark:border-green-800 p-4">
                                    <DollarSign className="size-8 text-green-600" />
                                </div>
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 flex aspect-square items-center justify-center border border-purple-200 dark:border-purple-800 p-4">
                                    <Scale className="size-8 text-purple-600" />
                                </div>
                                <div className="rounded-lg aspect-square border border-dashed"></div>
                                <div className="rounded-lg bg-muted/50 flex aspect-square items-center justify-center border p-4">
                                    <Users className="size-8 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
