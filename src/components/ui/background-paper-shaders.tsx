"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Mesh gradient shader for subtle background effect
const meshVertexShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    // Subtle wave motion
    pos.z += sin(pos.x * 3.0 + time * 0.5) * 0.3;
    pos.z += cos(pos.y * 2.0 + time * 0.3) * 0.2;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const meshFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform vec3 color4;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    // Create flowing gradient pattern
    float pattern1 = sin(uv.x * 3.0 + time * 0.2) * cos(uv.y * 3.0 - time * 0.15);
    float pattern2 = sin(uv.x * 5.0 - time * 0.1) * sin(uv.y * 4.0 + time * 0.25);
    
    // Mix multiple colors based on patterns
    vec3 color = mix(color1, color2, (pattern1 + 1.0) * 0.5);
    color = mix(color, color3, (pattern2 + 1.0) * 0.3);
    color = mix(color, color4, length(uv - 0.5) * 0.4);
    
    // Very subtle opacity for background effect
    float alpha = 0.3 + sin(time * 0.5) * 0.1;
    
    gl_FragColor = vec4(color, alpha);
  }
`

export function MeshGradientPlane({
  position = [0, 0, 0],
  colors = ["#000000", "#1a1a1a", "#333333", "#ffffff"],
}: {
  position?: [number, number, number]
  colors?: string[]
}) {
  const mesh = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(colors[0] || "#000000") },
        color2: { value: new THREE.Color(colors[1] || "#1a1a1a") },
        color3: { value: new THREE.Color(colors[2] || "#333333") },
        color4: { value: new THREE.Color(colors[3] || "#ffffff") },
      },
      vertexShader: meshVertexShader,
      fragmentShader: meshFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [colors])

  useFrame((state) => {
    if (material.uniforms) {
      material.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={mesh} position={position} material={material}>
      <planeGeometry args={[20, 20, 64, 64]} />
    </mesh>
  )
}

// Dot orbit effect
export function DotOrbit({
  count = 50,
  radius = 3,
}: {
  count?: number
  radius?: number
}) {
  const points = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = radius + Math.random() * 0.5
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = Math.sin(angle) * r
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2
      sizes[i] = Math.random() * 0.05 + 0.02
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    return geo
  }, [count, radius])

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.05,
      color: "#333333",
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    })
  }, [])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <points ref={points} geometry={geometry} material={material} />
  )
}
