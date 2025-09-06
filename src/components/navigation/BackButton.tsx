
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

const BackButton = ({ className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    console.log('🔙 Navigating back to Minha Saúde');
    navigate('/user/dashboard');
  };

  return (
    <button 
      onClick={handleBack}
      className={`inline-flex items-center text-royal-blue hover:text-navy-blue transition-colors duration-200 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar para Minha Saúde
    </button>
  );
};

export default BackButton;
