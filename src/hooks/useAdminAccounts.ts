
import { useState, useEffect } from 'react';
import { AdminUser, AdminPrestador, Company, ChangeRequest, Feedback, EmailAlert } from '@/types/admin';
import { adminAccountService } from '@/services/adminAccountService';

export const useAdminAccounts = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [prestadores, setPrestadores] = useState<AdminPrestador[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<AdminUser[]>([]);
  const [inactivePrestadores, setInactivePrestadores] = useState<AdminPrestador[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [individualUsers, setIndividualUsers] = useState<AdminUser[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveData = async () => {
    try {
      setLoading(true);
      const [usersData, prestadoresData, companiesData, individualUsersData, changeRequestsData, feedbackData, emailAlertsData] = await Promise.all([
        adminAccountService.getActiveUsers(),
        adminAccountService.getActivePrestadores(),
        adminAccountService.getCompanieWithUsers(),
        adminAccountService.getIndividualUsers(),
        adminAccountService.getChangeRequests(),
        adminAccountService.getFeedback(),
        adminAccountService.getEmailAlerts()
      ]);
      setUsers(usersData);
      setPrestadores(prestadoresData);
      setCompanies(companiesData);
      setIndividualUsers(individualUsersData);
      setChangeRequests(changeRequestsData);
      setFeedback(feedbackData);
      setEmailAlerts(emailAlertsData);
      setPendingRequestsCount(changeRequestsData.filter(req => req.status === 'pending').length);
    } catch (error) {
      console.error('Error fetching active admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInactiveData = async () => {
    try {
      const [inactiveUsersData, inactivePrestadoresData] = await Promise.all([
        adminAccountService.getInactiveUsers(),
        adminAccountService.getInactivePrestadores()
      ]);
      setInactiveUsers(inactiveUsersData);
      setInactivePrestadores(inactivePrestadoresData);
    } catch (error) {
      console.error('Error fetching inactive admin data:', error);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchActiveData(), fetchInactiveData()]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const createUser = async (userData: { name: string; email: string; password?: string; role?: 'user' | 'hr'; company: string | null; companySessions: number; isActive: boolean }) => {
    try {
      const newUser = await adminAccountService.createUser(userData);
      await fetchActiveData(); // Refresh all data to update company groupings
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const createPrestador = async (prestadorData: { name: string; email: string; specialty: string; isActive: boolean }) => {
    try {
      const newPrestador = await adminAccountService.createPrestador(prestadorData);
      await fetchActiveData(); // Refresh all data to update prestador list
      return newPrestador;
    } catch (error) {
      console.error('Error creating prestador:', error);
      throw error;
    }
  };

  const updateUserSessions = async (userId: string, sessions: number) => {
    try {
      await adminAccountService.updateUserSessions(userId, sessions);
      await fetchActiveData(); // Refresh to update company totals
    } catch (error) {
      console.error('Error updating user sessions:', error);
      // Re-throw the error so the UI can handle it
      const errorMessage = error instanceof Error ? error.message : 'Failed to update sessions';
      throw new Error(errorMessage);
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      await adminAccountService.deactivateUser(userId);
      await fetchActiveData();
      await fetchInactiveData();
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  };

  const reactivateUser = async (userId: string) => {
    try {
      await adminAccountService.reactivateUser(userId);
      await fetchActiveData();
      await fetchInactiveData();
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  };

  const deactivatePrestador = async (prestadorId: string) => {
    try {
      await adminAccountService.deactivatePrestador(prestadorId);
      const deactivatedPrestador = prestadores.find(prestador => prestador.id === prestadorId);
      if (deactivatedPrestador) {
        setPrestadores(prev => prev.filter(prestador => prestador.id !== prestadorId));
        setInactivePrestadores(prev => [...prev, { ...deactivatedPrestador, isActive: false }]);
      }
    } catch (error) {
      console.error('Error deactivating prestador:', error);
      throw error;
    }
  };

  const reactivatePrestador = async (prestadorId: string) => {
    try {
      await adminAccountService.reactivatePrestador(prestadorId);
      const reactivatedPrestador = inactivePrestadores.find(prestador => prestador.id === prestadorId);
      if (reactivatedPrestador) {
        setInactivePrestadores(prev => prev.filter(prestador => prestador.id !== prestadorId));
        setPrestadores(prev => [...prev, { ...reactivatedPrestador, isActive: true }]);
      }
    } catch (error) {
      console.error('Error reactivating prestador:', error);
      throw error;
    }
  };

  const approveChangeRequest = async (requestId: string) => {
    try {
      await adminAccountService.approveChangeRequest(requestId, 'Admin');
      await fetchActiveData(); // Refresh to update data
    } catch (error) {
      console.error('Error approving change request:', error);
      throw error;
    }
  };

  const rejectChangeRequest = async (requestId: string) => {
    try {
      await adminAccountService.rejectChangeRequest(requestId, 'Admin');
      await fetchActiveData(); // Refresh to update data
    } catch (error) {
      console.error('Error rejecting change request:', error);
      throw error;
    }
  };

  const sendEmailAlert = async (alertId: string) => {
    try {
      await adminAccountService.sendEmailAlert(alertId);
      setEmailAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'sent' as const, sentAt: new Date().toISOString() } : alert
      ));
    } catch (error) {
      console.error('Error sending email alert:', error);
      throw error;
    }
  };

  const createEmailAlert = async (alertData: Omit<EmailAlert, 'id' | 'createdAt' | 'status'>) => {
    try {
      const newAlert = await adminAccountService.createEmailAlert(alertData);
      setEmailAlerts(prev => [...prev, newAlert]);
      return newAlert;
    } catch (error) {
      console.error('Error creating email alert:', error);
      throw error;
    }
  };

  return {
    users,
    prestadores,
    inactiveUsers,
    inactivePrestadores,
    companies,
    individualUsers,
    changeRequests,
    pendingRequestsCount,
    feedback,
    emailAlerts,
    loading,
    createUser,
    createPrestador,
    updateUserSessions,
    deactivateUser,
    reactivateUser,
    deactivatePrestador,
    reactivatePrestador,
    approveChangeRequest,
    rejectChangeRequest,
    sendEmailAlert,
    createEmailAlert,
    refetch: fetchAllData,
    getUsersByPrestador: adminAccountService.getUsersByPrestador.bind(adminAccountService),
    getPrestadorsByUser: adminAccountService.getPrestadorsByUser.bind(adminAccountService)
  };
};
