import { useRef } from 'react';

export function Media() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const openMediaDevices = async (constraints: MediaStreamConstraints) => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleMediaDevices = () => {
    try {
      const stream = openMediaDevices({
        video: { width: 800, height: 800 },
        // video: true,
        audio: true,
      });

      console.log(stream);
    } catch (error) {
      console.error('error accessing media', error);
    }
  };

  const handleCloseMedia = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button onClick={handleMediaDevices}>test media</button>
      <button onClick={handleCloseMedia}>close media</button>
      <video
        id={'localVideo'}
        autoPlay
        playsInline
        controls={false}
        ref={videoRef}
      />
    </div>
  );
}
