import React from 'react';
import { useCompanyNotes } from "@/hooks/useCompanyNotes";

interface CompanyFinalNotesProps {
  companyName: string;
}

const CompanyFinalNotes: React.FC<CompanyFinalNotesProps> = ({ companyName }) => {
  const { finalNotes, loading, error } = useCompanyNotes(companyName);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (!finalNotes) {
    return (
      <div className="bg-soft-white/50 border border-soft-white rounded-lg p-6 text-center">
        <p className="text-slate-grey/60 italic">
          Nenhuma observação final foi adicionada pelo administrador para esta empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="bg-soft-white/50 border border-soft-white rounded-lg p-4">
        <p className="text-slate-grey whitespace-pre-wrap leading-relaxed">
          {finalNotes}
        </p>
      </div>
      <p className="text-xs text-slate-grey/60 text-right">
        Observações definidas pelo administrador
      </p>
    </div>
  );
};

export default CompanyFinalNotes;