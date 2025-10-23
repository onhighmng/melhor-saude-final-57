import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: number;
  name: string;
  email: string;
  company: string;
  sessions: { used: number; total: number };
  rating?: number;
  objectives?: string[];
  sessionHistory?: Array<{
    date: string;
    category: string;
    provider: string;
  }>;
}

interface EmployeeDetailModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeDetailModal = ({ employee, open, onOpenChange }: EmployeeDetailModalProps) => {
  if (!employee) return null;

  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pt-2">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{employee.name}</h2>
            <p className="text-muted-foreground">{employee.email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Sessões</span>
              </div>
              <p className="text-3xl font-semibold">
                {employee.sessions.used}/{employee.sessions.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Avaliação</span>
              </div>
              <p className="text-3xl font-semibold">
                {employee.rating || '4.5'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Objectives */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Objetivos</h3>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {(employee.objectives || ['Gestão de ansiedade', 'Questões contratuais']).map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <span className="text-base">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Session History */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Histórico de Sessões</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {(employee.sessionHistory || [
                  { date: '15/01/2025', category: 'Saúde Mental', provider: 'Dra. Maria Santos' }
                ]).map((session, index) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{session.category}</p>
                      <p className="text-sm text-muted-foreground">{session.provider}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{session.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
