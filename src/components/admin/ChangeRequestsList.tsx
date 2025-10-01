import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Check, X, Eye, Clock } from 'lucide-react';
import { ChangeRequest } from '@/types/admin';

interface ChangeRequestsListProps {
  requests: ChangeRequest[];
  onApproveRequest: (requestId: string) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
}

const ChangeRequestsList = ({ requests, onApproveRequest, onRejectRequest }: ChangeRequestsListProps) => {
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<ChangeRequest | null>(null);

  const handleApprove = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await onApproveRequest(requestId);
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await onRejectRequest(requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Solicitações Pendentes ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Não há solicitações pendentes no momento.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id} className="bg-orange-50/50">
                      <TableCell className="font-medium">{request.prestadorName}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{request.fieldLabel}</span>
                          {request.reason && (
                            <p className="text-xs text-gray-500 mt-1">{request.reason}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingRequest(request)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Solicitação de Alteração - {request.fieldLabel}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Valor Atual:</h4>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                      {request.field === 'photo' ? (
                                        <img src={request.currentValue} alt="Current" className="w-16 h-16 rounded-full object-cover" />
                                      ) : (
                                        <p className="text-sm">{request.currentValue}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Valor Solicitado:</h4>
                                    <div className="p-3 bg-blue-50 rounded-md">
                                      {request.field === 'photo' ? (
                                        <img src={request.requestedValue} alt="Requested" className="w-16 h-16 rounded-full object-cover" />
                                      ) : (
                                        <p className="text-sm">{request.requestedValue}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {request.reason && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Motivo:</h4>
                                    <p className="text-sm bg-gray-50 p-3 rounded-md">{request.reason}</p>
                                  </div>
                                )}
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => {
                                      handleApprove(request.id);
                                      setViewingRequest(null);
                                    }}
                                    disabled={processingRequest === request.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        disabled={processingRequest === request.id}
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Rejeitar
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Rejeitar Solicitação</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja rejeitar esta solicitação de alteração?
                                          Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            handleReject(request.id);
                                            setViewingRequest(null);
                                          }}
                                          className="bg-destructive text-white hover:bg-destructive/90"
                                        >
                                          Rejeitar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processingRequest === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            {processingRequest === request.id ? 'Processando...' : 'Aprovar'}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={processingRequest === request.id}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Rejeitar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar Solicitação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja rejeitar a solicitação de <strong>{request.prestadorName}</strong> para alterar <strong>{request.fieldLabel}</strong>?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReject(request.id)}
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                  Rejeitar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Histórico de Solicitações ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead>Processado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.prestadorName}</TableCell>
                      <TableCell>{request.fieldLabel}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell>{request.reviewedAt ? formatDate(request.reviewedAt) : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                          {request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingRequest(request)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChangeRequestsList;