
import React from 'react';

const AnimatedCircles: React.FC = () => {
  return (
    <>
      <circle
        cx="290"
        cy="50"
        r="4"
        fill="rgb(30,133,116)"
        className="animate-pulse"
        style={{
          animationDelay: '0.5s',
          animationDuration: '2s'
        }}
      />
      
      <circle
        cx="302"
        cy="45"
        r="2.5"
        fill="rgb(30,133,116)"
        opacity="0.7"
        className="animate-pulse"
        style={{
          animationDelay: '1s',
          animationDuration: '2.5s'
        }}
      />

      <circle
        cx="295"
        cy="60"
        r="2"
        fill="rgb(30,133,116)"
        opacity="0.5"
        className="animate-pulse"
        style={{
          animationDelay: '1.5s',
          animationDuration: '3s'
        }}
      />
    </>
  );
};

export default AnimatedCircles;
