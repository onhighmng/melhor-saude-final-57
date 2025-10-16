import { Canvas } from '@react-three/fiber';
import { ShaderPlane, EnergyRing } from './background-paper-shaders';

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      {/* Lighting overlay effects matching demo */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '3s' }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: '2s', animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse"
          style={{ animationDuration: '4s', animationDelay: '0.5s' }}
        />
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ShaderPlane 
          position={[0, 0, 0]} 
          color1="#000000" 
          color2="#1a1a1a" 
        />
        <EnergyRing radius={1.5} position={[0, 0, 0.1]} />
      </Canvas>
    </div>
  );
}
