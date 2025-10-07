import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, Clock, TrendingUp, CheckCircle, XCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ChangeRequest {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  pillar: "Saúde Mental" | "Bem-estar Físico" | "Assistência Financeira" | "Assistência Jurídica";
  currentProvider: {
    name: string;
    avatar?: string;
    atCapacity?: boolean;
  };
  preferences: string;
  reason: string;
  slaRemaining: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const mockChangeRequests: ChangeRequest[] = [
  {
    id: "1",
    user: { name: "João Silva", avatar: "/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png" },
    pillar: "Saúde Mental",
    currentProvider: { name: "Leslie Alexander", avatar: "/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png" },
    preferences: "Prefer switch to a new therapist",
    reason: "Looking for a more suitable provider",
    slaRemaining: 7,
    status: "pending",
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    user: { name: "Maria Santos", avatar: "/lovable-uploads/0daa1ba3-5b7c-49db-950f-22ccfee40b86.png" },
    pillar: "Saúde Mental",
    currentProvider: { name: "Guy Hawkins", avatar: "/lovable-uploads/18286dba-299d-452d-b21d-2860965d5785.png", atCapacity: true },
    preferences: "Prefer therapy of a different format",
    reason: "Format does not meet expectations", 
    slaRemaining: 3,
    status: "pending",
    createdAt: "2024-01-18"
  },
  {
    id: "3",
    user: { name: "Cristina Silva", avatar: "/lovable-uploads/2315135f-f033-4434-be6f-1ad3824c1ebb.png" },
    pillar: "Bem-estar Físico", 
    currentProvider: { name: "Theresa Webb", avatar: "/lovable-uploads/5098d52a-638c-4f18-8bf0-36058ff94187.png" },
    preferences: "Prefer online sessions only",
    reason: "No preference needed left",
    slaRemaining: 5,
    status: "pending",
    createdAt: "2024-01-16"
  },
  {
    id: "4",
    user: { name: "Pedro Costa", avatar: "/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png" },
    pillar: "Assistência Financeira",
    currentProvider: { name: "Floyd Miles", avatar: "/lovable-uploads/5d2071d4-8909-4e5f-b30d-cf52091ffba9.png" },
    preferences: "Need help with tax planning",
    reason: "Need help with tax planning",
    slaRemaining: 1,
    status: "pending", 
    createdAt: "2024-01-20"
  }
];

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case "Saúde Mental": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Bem-estar Físico": return "bg-green-100 text-green-800 border-green-200";
    case "Assistência Financeira": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Assistência Jurídica": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const AdminProviderChangeRequests = () => {
  const { t } = useTranslation('admin');
  const [requests, setRequests] = useState(mockChangeRequests);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [requestInfoMessage, setRequestInfoMessage] = useState("");

  const pendingRequests = requests.filter(r => r.status === "pending");
  const slaViolations = pendingRequests.filter(r => r.slaRemaining <= 1).length;
  const capacityWarnings = pendingRequests.filter(r => r.currentProvider.atCapacity).length;

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: "approved" as const } : r
    ));
  };

  const handleReject = (requestId: string, reason: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: "rejected" as const } : r
    ));
    setRejectReason("");
    setSelectedRequest(null);
  };

  const handleRequestInfo = (requestId: string, message: string) => {
    console.log(`Requesting info from user for request ${requestId}: ${message}`);
    setRequestInfoMessage("");
    setSelectedRequest(null);
  };

  const getSLABadgeVariant = (days: number) => {
    if (days <= 1) return "destructive";
    if (days <= 3) return "outline";
    return "secondary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('changeRequests.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('changeRequests.subtitle')}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('changeRequests.kpis.pendingRequests')}
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {t('changeRequests.kpis.awaitingDecision')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('changeRequests.kpis.slaViolations')}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Math.round((slaViolations / pendingRequests.length) * 100) || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {slaViolations} {t('changeRequests.kpis.violatedThisWeek')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('changeRequests.kpis.capacityWarnings')}
              </CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{capacityWarnings}</div>
              <p className="text-xs text-muted-foreground">
                {t('changeRequests.kpis.saturatedProviders')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('changeRequests.kpis.utilizationRate')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">84%</div>
              <p className="text-xs text-muted-foreground">
                {t('changeRequests.kpis.avgUtilization')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Change Requests Table */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t('changeRequests.table.changeRequests')}</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {t('changeRequests.empty.noPending')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('changeRequests.empty.allProcessed')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">{t('changeRequests.table.user')}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t('changeRequests.table.pillar')}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t('changeRequests.table.currentProvider')}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t('changeRequests.table.preferences')}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t('changeRequests.table.reason')}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t('changeRequests.table.sla')}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t('changeRequests.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((request) => (
                      <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.user.avatar} alt={request.user.name} />
                              <AvatarFallback>{request.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{request.user.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-xs ${getPillarColor(request.pillar)}`}>
                            {request.pillar}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.currentProvider.avatar} alt={request.currentProvider.name} />
                              <AvatarFallback>{request.currentProvider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-foreground">{request.currentProvider.name}</span>
                              {request.currentProvider.atCapacity && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3 text-red-600" />
                                  <span className="text-xs text-red-600">{t('changeRequests.table.atMaxCapacity')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{request.preferences}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-foreground">{request.reason}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={getSLABadgeVariant(request.slaRemaining)}>
                            {request.slaRemaining === 1 ? `1 ${t('changeRequests.table.day')}` : `${request.slaRemaining} ${t('changeRequests.table.days')}`}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t('changeRequests.table.approve')}
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {t('changeRequests.table.reject')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('changeRequests.dialogs.rejectRequest')}</DialogTitle>
                                  <DialogDescription>
                                    {t('changeRequests.dialogs.rejectRequestDesc', { name: request.user.name })}
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  placeholder={t('changeRequests.dialogs.provideReason')}
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                />
                                <DialogFooter>
                                  <Button
                                    onClick={() => handleReject(request.id, rejectReason)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    {t('changeRequests.dialogs.confirmRejection')}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <Info className="h-3 w-3 mr-1" />
                                  {t('changeRequests.table.requestInfo')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('changeRequests.dialogs.requestMoreInfo')}</DialogTitle>
                                  <DialogDescription>
                                    {t('changeRequests.dialogs.requestMoreInfoDesc', { name: request.user.name })}
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  placeholder={t('changeRequests.dialogs.whatInfoNeeded')}
                                  value={requestInfoMessage}
                                  onChange={(e) => setRequestInfoMessage(e.target.value)}
                                />
                                <DialogFooter>
                                  <Button
                                    onClick={() => handleRequestInfo(request.id, requestInfoMessage)}
                                  >
                                    {t('changeRequests.dialogs.sendRequest')}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProviderChangeRequests;
