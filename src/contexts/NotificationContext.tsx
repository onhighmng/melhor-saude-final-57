export const NotificationProvider = ({ children }: any) => <>{children}</>;

export const useNotifications = () => ({
  isSupported: true,
  permission: 'default' as NotificationPermission,
  requestPermission: async () => {},
  token: null,
});
