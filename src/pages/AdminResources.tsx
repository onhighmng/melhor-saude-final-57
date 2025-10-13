import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminResourcesTab } from "@/components/admin/AdminResourcesTab";
import { AdminRecommendationsTab } from "@/components/admin/AdminRecommendationsTab";
import { AdminResultsTab } from "@/components/admin/AdminResultsTab";
import { useTranslation } from "react-i18next";

export default function AdminResources() {
  const { t } = useTranslation('admin');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gestão de Recursos e Resultados
        </h1>
        <p className="text-muted-foreground">
          Gerir conteúdos, visualizar recomendações e analisar resultados da plataforma
        </p>
      </div>

      <Tabs defaultValue="recursos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="recursos" className="mt-6">
          <AdminResourcesTab />
        </TabsContent>

        <TabsContent value="recomendacoes" className="mt-6">
          <AdminRecommendationsTab />
        </TabsContent>

        <TabsContent value="resultados" className="mt-6">
          <AdminResultsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
