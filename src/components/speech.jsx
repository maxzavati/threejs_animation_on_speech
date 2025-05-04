import { useCallback, useEffect, useRef } from 'react';

export function Speech({ audioData, setAudioData }) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const freqDataArrayRef = useRef(null);
  const timeDataArrayRef = useRef(null);
  const animationIdRef = useRef(null);

  const startListening = async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new (window.AudioContext ||
        window.AudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio nodes
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;

      source.connect(analyserRef.current);

      // Initialize data arrays
      const bufferLength = analyserRef.current.frequencyBinCount;
      freqDataArrayRef.current = new Uint8Array(bufferLength);
      timeDataArrayRef.current = new Uint8Array(bufferLength);

      // Start animation loop
      const updateAudioData = () => {
        analyserRef.current.getByteFrequencyData(freqDataArrayRef.current);
        analyserRef.current.getByteTimeDomainData(timeDataArrayRef.current);

        setAudioData({
          frequencyData: [...freqDataArrayRef.current],
          timeDomainData: [...timeDataArrayRef.current],
        });

        animationIdRef.current = requestAnimationFrame(updateAudioData);
      };

      updateAudioData();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopListening = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setAudioData(null);
  }, [setAudioData]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div>
      <button onClick={audioData ? stopListening : startListening}>
        {audioData ? 'STOP' : 'PRESS TO SPEAK'}
      </button>
      <p>
        {audioData
          ? 'Speak or play music to see the visualization'
          : 'Microphone access required'}
      </p>
    </div>
  );
}
