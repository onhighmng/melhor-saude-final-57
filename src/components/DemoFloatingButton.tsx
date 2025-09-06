import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TestTube } from 'lucide-react';

const DemoFloatingButton = () => {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    console.log('Demo button clicked - navigating to /demo');
    navigate('/demo');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleDemoClick}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-3 group"
        size="lg"
      >
        <TestTube className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-medium">Demo</span>
      </Button>
    </div>
  );
};

export default DemoFloatingButton;