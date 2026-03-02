"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { useGLTF, Environment, Float, PresentationControls } from "@react-three/drei";

export function CreditCard3D() {
    const meshRef = useRef<Mesh>(null);

    // Smooth rotation tracking mouse
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        // Gentle floating plus mouse movement influence
        meshRef.current.rotation.y = (state.pointer.x * Math.PI) / 8;
        meshRef.current.rotation.x = -(state.pointer.y * Math.PI) / 8;
    });

    return (
        <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
            <Float
                speed={2} // Animation speed
                rotationIntensity={0.5} // XYZ rotation intensity
                floatIntensity={1} // Up/down float intensity
                floatingRange={[-0.1, 0.1]} // Range of y-axis values
            >
                <mesh ref={meshRef} castShadow receiveShadow>
                    <boxGeometry args={[3.375, 2.125, 0.05]} /> {/* Standard CC ratio 85.60 × 53.98 */}
                    <meshStandardMaterial
                        color="#1a1a1a"
                        metalness={0.9}
                        roughness={0.1}
                        envMapIntensity={1.5}
                    />
                    {/* Accent strip */}
                    <mesh position={[0, 0.5, 0.026]}>
                        <planeGeometry args={[3.375, 0.2]} />
                        <meshBasicMaterial color="#22C55E" />
                    </mesh>
                </mesh>
            </Float>
        </PresentationControls>
    );
}

export function HeroScene() {
    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
            <CreditCard3D />
        </>
    );
}
