import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageCircle, Headset, ArrowLeft } from "lucide-react";
import { SupportAssistant } from "@/components/support/SupportAssistant";
import { SupportForm } from "@/components/support/SupportForm";

export default function Support() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assistant");

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {/* Back Button */}
      <Button
          variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-['Baskervville'] text-3xl md:text-4xl font-semibold text-foreground mb-2">
          Como podemos ajudar?
        </h1>
        <p className="font-['Noto_Serif'] text-sm md:text-base text-black/60">
          Escolha a melhor forma de obter suporte
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger 
            value="assistant" 
            className="flex items-center gap-2 font-['Noto_Serif']"
          >
            <MessageCircle className="h-4 w-4" />
            Assistente Virtual
          </TabsTrigger>
          <TabsTrigger 
            value="human" 
            className="flex items-center gap-2 font-['Noto_Serif']"
          >
            <Headset className="h-4 w-4" />
            Suporte Humano
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant">
          <div className="rounded-2xl border border-black/5 shadow-lg bg-white/80 backdrop-blur p-6 md:p-8">
            <SupportAssistant />
          </div>
        </TabsContent>

        <TabsContent value="human">
          <div className="rounded-2xl border border-black/5 shadow-lg bg-white/80 backdrop-blur p-6 md:p-8">
            <SupportForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}