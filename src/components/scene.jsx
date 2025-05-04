import { useState } from 'react';
import { Canvas } from '@react-three/fiber';

import s from './styles.module.css';
import { Speech } from './speech';
import { MeshAnimation } from './mesh';

export function Scene() {
  const [audioData, setAudioData] = useState(null);

  return (
    <div className={s.scene}>
      <div>
        <div className={s.canvas}>
          <Canvas>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} />
            <MeshAnimation audioData={audioData} />
          </Canvas>
        </div>

        <Speech audioData={audioData} setAudioData={setAudioData} />
      </div>
    </div>
  );
}
