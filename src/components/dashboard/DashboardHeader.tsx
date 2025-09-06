import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardHeader = () => {
  const { user } = useAuth();
  
  // Extract first name from display name or email
  const getFirstName = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Utilizador';
  };

  return (
    <div className="text-center lg:text-left space-y-4">
      <div className="space-y-3">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
          Olá, {getFirstName()}! 👋
        </h1>
      </div>
      <p className="text-gray-600 text-lg max-w-2xl">
        Bem-vinda de volta ao seu espaço de saúde e bem-estar.
      </p>
    </div>
  );
};