import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Heart, DollarSign, Scale, Users, TrendingUp, Key, CheckCircle, Copy, Download, XCircle } from 'lucide-react'

interface FeaturesGridProps {
    onGenerateCode?: () => void;
    codesGenerated?: number;
    seatsAvailable?: number;
    canGenerateMore?: boolean;
    generatedCodes?: string[];
    onCopyCode?: (code: string) => void;
    onDownloadCodes?: () => void;
    seatLimit?: number;
    seatUsed?: number;
    seatUsagePercent?: number;
}

export function FeaturesGrid({
    onGenerateCode,
    codesGenerated = 0,
    seatsAvailable = 0,
    canGenerateMore = true,
    generatedCodes = [],
    onCopyCode,
    onDownloadCodes,
    seatLimit = 0,
    seatUsed = 0,
    seatUsagePercent = 0
}: FeaturesGridProps) {
    return (
        <section className="bg-background py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto grid gap-2 sm:grid-cols-5">
                    <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl hover-lift">
                        <CardHeader>
                            <div className="md:p-6">
                                <p className="font-semibold text-2xl text-foreground">Geração de Códigos de Acesso</p>
                                <p className="text-muted-foreground mt-3 max-w-sm text-base">
                                    Crie códigos únicos de acesso para distribuir aos colaboradores de forma segura e anônima.
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="px-6 md:px-12 pb-6 md:pb-12">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Crie códigos únicos para distribuição em massa aos colaboradores
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button 
                                        onClick={onGenerateCode}
                                        disabled={!canGenerateMore}
                                        size="lg"
                                        className="gap-2"
                                    >
                                        <Key className="h-4 w-4" />
                                        Gerar Código ({codesGenerated}/{seatsAvailable})
                                    </Button>

                                    {generatedCodes.length > 0 && (
                                        <Button 
                                            onClick={onDownloadCodes}
                                            variant="outline"
                                            size="lg"
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Exportar Códigos ({generatedCodes.length})
                                        </Button>
                                    )}
                                </div>

                                {codesGenerated >= seatsAvailable && seatsAvailable > 0 && (
                                    <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20">
                                        <XCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            Limite de códigos atingido. Já foram gerados {seatsAvailable} códigos disponíveis.
                                        </p>
                                    </div>
                                )}

                                {generatedCodes.length > 0 ? (
                                    <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                                        {generatedCodes.map((code, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                                <code className="text-base font-mono bg-muted px-3 py-2 rounded font-semibold">
                                                    {code}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onCopyCode?.(code)}
                                                    className="gap-2"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    Copiar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Key className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-base">Nenhum código gerado ainda</p>
                                        <p className="text-sm mt-1">Clique no botão acima para gerar códigos de acesso</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl hover-lift">
                        <p className="mx-auto my-6 max-w-md text-balance px-6 text-center text-lg font-semibold sm:text-2xl md:p-6">
                            Taxa de Utilização
                        </p>

                        <CardContent className="mt-auto h-fit">
                            <div className="relative mb-6 sm:mb-0">
                                <div className="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                                <div className="overflow-hidden rounded-r-lg border bg-card p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <span className="text-sm text-muted-foreground">Total de Contas</span>
                                            <span className="text-2xl font-bold text-foreground">{seatLimit}</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <span className="text-sm text-muted-foreground">Contas Ativas</span>
                                            <span className="text-2xl font-bold text-emerald-600">{seatUsed}</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <span className="text-sm text-muted-foreground">Contas Disponíveis</span>
                                            <span className="text-2xl font-bold text-blue-600">{seatsAvailable}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm font-semibold text-muted-foreground">Taxa de Utilização</span>
                                            <span className="text-3xl font-bold text-primary">{seatUsagePercent}%</span>
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
