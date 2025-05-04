import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { meshShaders } from './shaders';

export function MeshAnimation({ audioData }) {
  const meshRef = useRef();
  const prevAudioLevel = useRef(0);
  const audioHistory = useRef(new Array(10).fill(0));
  const time = useRef(0);

  const shaderObject = meshShaders({ audioHistory });

  useFrame((_, delta) => {
    if (!audioData || !meshRef.current) return;

    let sum = 0;
    for (let i = 0; i < audioData.frequencyData.length; i++) {
      sum += audioData.frequencyData[i];
    }
    const avgVolume = sum / audioData.frequencyData.length;
    const normalizedLevel = Math.min(avgVolume / 255, 1.0);

    const smoothedLevel = THREE.MathUtils.lerp(
      prevAudioLevel.current,
      normalizedLevel,
      0.25
    );
    prevAudioLevel.current = smoothedLevel;

    audioHistory.current.shift();
    audioHistory.current.push(smoothedLevel);

    if (meshRef.current.material) {
      time.current += delta;
      meshRef.current.material.uniforms.uTime.value = time.current;
      meshRef.current.material.uniforms.uAudioLevel.value = smoothedLevel;
      meshRef.current.material.uniforms.uAudioHistory.value =
        audioHistory.current;
    }

    // Scale can be subtle or fixed if you prefer
    const scale = 1.0 + smoothedLevel * 0.8;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef}>
      <circleGeometry args={[8, 128]} />
      <primitive object={shaderObject} attach='material' />
    </mesh>
  );
}
