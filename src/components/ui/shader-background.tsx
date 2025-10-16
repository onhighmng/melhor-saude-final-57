import { Canvas } from '@react-three/fiber';
import { MeshGradientPlane, DotOrbit } from './background-paper-shaders';

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Subtle pulse overlays matching demo */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse" 
           style={{ animationDuration: '2s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse" 
           style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        className="opacity-20"
      >
        <MeshGradientPlane 
          position={[0, 0, 0]} 
          colors={["#3b82f6", "#1e40af", "#0f172a", "#8b5cf6"]}
        />
        <DotOrbit count={60} radius={4} />
      </Canvas>
    </div>
  );
}
