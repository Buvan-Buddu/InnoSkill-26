'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// Particle Field Component in Pearl Blue
function ParticleField({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#2F6FED"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

// 3D Nodes Network Component
function NodesNetwork({ speedMultiplier = 1 }: { speedMultiplier: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Nodes representing Skills, Careers, AI, Accessibility, Opportunity
  const nodes = [
    { id: 'skills', position: new THREE.Vector3(-1.8, 1.0, 0.5), label: 'Skills', color: '#2F6FED', size: 0.2 },
    { id: 'accessibility', position: new THREE.Vector3(1.5, -1.2, 1.0), label: 'Accessibility', color: '#163B73', size: 0.2 },
    { id: 'career', position: new THREE.Vector3(1.6, 1.2, -0.8), label: 'Career', color: '#245ED0', size: 0.2 },
    { id: 'opportunity', position: new THREE.Vector3(-1.4, -1.3, -0.6), label: 'Opportunity', color: '#2F6FED', size: 0.2 },
    { id: 'ai', position: new THREE.Vector3(0.0, 2.0, -0.4), label: 'AI Engine', color: '#1D4FB5', size: 0.18 },
    { id: 'comm', position: new THREE.Vector3(-0.8, -2.1, 0.8), label: 'Communication', color: '#163B73', size: 0.18 },
  ];

  useFrame((state) => {
    if (groupRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const baseRotationY = elapsed * 0.15 * speedMultiplier;
      
      const targetRotationY = baseRotationY + (state.pointer.x * 0.25);
      const targetRotationX = (state.pointer.y * 0.2) + (Math.sin(elapsed * 0.08) * 0.05 * speedMultiplier);
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      
      {/* Central Abstract Shape */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color="#2F6FED"
          emissive="#2F6FED"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Concentric rings */}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#163B73"
          emissive="#163B73"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#2F6FED"
          emissive="#2F6FED"
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      </mesh>
      
      {/* Glowing core sphere */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#2F6FED"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Floating Surrounding Nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNode === node.id;
        return (
          <mesh
            key={node.id}
            position={node.position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode(node.id);
            }}
            onPointerOut={() => setHoveredNode(null)}
          >
            <sphereGeometry args={[node.size * (isHovered ? 1.25 : 1), 32, 32]} />
            <meshStandardMaterial
              color={isHovered ? '#ffffff' : node.color}
              emissive={node.color}
              emissiveIntensity={isHovered ? 1.0 : 0.6}
              roughness={0.1}
              metalness={0.2}
            />
            <Html distanceFactor={6} position={[0, node.size + 0.25, 0]} center>
              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight border transition-all duration-200 pointer-events-none select-none ${
                isHovered
                  ? 'bg-[#2F6FED] text-white border-[#2F6FED] scale-110 shadow-md'
                  : 'bg-white text-[#172033] border-[#DCE5F0] shadow-xs'
              }`}>
                {node.label}
              </div>
            </Html>
          </mesh>
        );
      })}

      {/* Connection lines */}
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          <Line
            points={[new THREE.Vector3(0, 0.6, 0), node.position]}
            color="#2F6FED"
            lineWidth={1.2}
            opacity={hoveredNode === node.id ? 0.7 : 0.2}
            transparent
          />
          <Line
            points={[new THREE.Vector3(0, -0.1, 0), node.position]}
            color="#163B73"
            lineWidth={1}
            opacity={hoveredNode === node.id ? 0.6 : 0.15}
            transparent
          />
        </React.Fragment>
      ))}

      <Line points={[nodes[0].position, nodes[4].position]} color="#2F6FED" lineWidth={0.8} opacity={0.15} transparent />
      <Line points={[nodes[1].position, nodes[5].position]} color="#163B73" lineWidth={0.8} opacity={0.15} transparent />
      <Line points={[nodes[2].position, nodes[3].position]} color="#2F6FED" lineWidth={0.8} opacity={0.15} transparent />
    </group>
  );
}

export default function ThreeVisual() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let support = true;
    try {
      const canvas = document.createElement('canvas');
      support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      support = false;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    const timer = setTimeout(() => {
      setHasWebGL(support);
      setPrefersReducedMotion(isReduced);
      setMounted(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  if (!mounted) {
    return <div className="w-full h-[320px] sm:h-[450px] bg-[#F7F9FC]" />;
  }

  // Graceful Fallback if WebGL is unavailable
  if (!hasWebGL) {
    return (
      <div className="w-full h-[350px] sm:h-[480px] flex items-center justify-center relative overflow-hidden">
        <svg className="w-full h-full p-6 max-w-sm text-[#2F6FED]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="80" r="16" fill="#EAF2FF" stroke="#2F6FED" strokeWidth="2.5" />
          <ellipse cx="100" cy="130" rx="30" ry="12" fill="#EAF2FF" stroke="#163B73" strokeWidth="2" />
          <circle cx="100" cy="100" r="4" fill="#2F6FED" />

          <line x1="100" y1="90" x2="35" y2="55" stroke="#2F6FED" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="100" y1="90" x2="165" y2="60" stroke="#163B73" strokeWidth="1.5" />
          <line x1="100" y1="90" x2="50" y2="155" stroke="#245ED0" strokeWidth="1.5" />
          <line x1="100" y1="90" x2="155" y2="145" stroke="#2F6FED" strokeWidth="1.5" strokeDasharray="3 3" />

          <circle cx="35" cy="55" r="9" fill="#EAF2FF" stroke="#2F6FED" strokeWidth="1.5" />
          <circle cx="165" cy="60" r="11" fill="#EAF2FF" stroke="#163B73" strokeWidth="1.5" />
          <circle cx="50" cy="155" r="10" fill="#EAF2FF" stroke="#245ED0" strokeWidth="1.5" />
          <circle cx="155" cy="145" r="9" fill="#EAF2FF" stroke="#2F6FED" strokeWidth="1.5" />

          <text x="35" y="72" textAnchor="middle" fill="#172033" fontSize="7" fontWeight="bold">Skills</text>
          <text x="165" y="45" textAnchor="middle" fill="#172033" fontSize="7" fontWeight="bold">Career</text>
          <text x="50" y="172" textAnchor="middle" fill="#172033" fontSize="7" fontWeight="bold">Accessibility</text>
          <text x="155" y="130" textAnchor="middle" fill="#172033" fontSize="7" fontWeight="bold">Opportunity</text>
        </svg>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-[360px] sm:h-[480px] relative select-none"
      role="img"
      aria-label="Interactive 3D network visualization showing connections between candidate skills, career path, and accommodations."
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2F6FED" />

        <ParticleField count={60} />
        <NodesNetwork speedMultiplier={prefersReducedMotion ? 0 : 1} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
        />
      </Canvas>
    </div>
  );
}
