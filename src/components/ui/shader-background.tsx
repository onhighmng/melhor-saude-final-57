import { Canvas } from '@react-three/fiber';
import { ShaderPlane, EnergyRing } from './background-paper-shaders';

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 z-0 opacity-20">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ShaderPlane 
          position={[0, 0, 0]} 
          color1="#3b82f6" 
          color2="#8b5cf6" 
        />
        <EnergyRing radius={1.5} position={[0, 0, 0.1]} />
      </Canvas>
    </div>
  );
}
