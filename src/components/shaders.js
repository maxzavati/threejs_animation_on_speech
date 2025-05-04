import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 3.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uAudioLevel;
  uniform float uAudioHistory[10];
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uFoam;

  varying vec2 vUv;

  // 2D Simplex noise (simplified)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;

    // Scroll noise field in multiple directions
    float t = uTime * 0.2;
    float n1 = noise(uv * 3.0 + vec2(t, t));
    float n2 = noise(uv * 4.0 + vec2(-t * 0.5, t * 1.5));
    float n3 = noise(uv * 2.0 + vec2(t * 1.2, -t * 0.8));

    float blob = (n1 + n2 + n3) / 3.0;

    // Audio-reactive turbulence
    float audioInfluence = uAudioLevel * 1.5;
    blob += noise(uv * 8.0 + vec2(uTime)) * audioInfluence;

    // Map to color zones
    vec3 color = mix(uColor1, uColor2, smoothstep(0.2, 0.5, blob));
    color = mix(color, uColor3, smoothstep(0.5, 0.8, blob));

    // White foam where audio is intense
    float foamMask = smoothstep(0.75, 0.95, blob) * uAudioLevel;
    color = mix(color, uFoam, foamMask);

    // Remove foggy fade: full alpha
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function meshShaders({ audioHistory }) {
  const colors = {
    color1: new THREE.Color('#007f5f'), // deep emerald green
    color2: new THREE.Color('#00c896'), // vivid turquoise green
    color3: new THREE.Color('#66f2c1'), // soft minty green
    foam: new THREE.Color('#ffffff'), // pure white (sparkle)
  };

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAudioLevel: { value: 0 },
      uAudioHistory: { value: audioHistory.current },
      uColor1: { value: colors.color1 },
      uColor2: { value: colors.color2 },
      uColor3: { value: colors.color3 },
      uFoam: { value: colors.foam },
    },
    vertexShader,
    fragmentShader,
    transparent: false,
    side: THREE.DoubleSide,
  });
}
