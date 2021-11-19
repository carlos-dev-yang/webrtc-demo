import { useRef } from 'react';
import { IPC } from './type';

export function Callee() {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  let pc2: IPC;

  return (
    <div>
      <video
        id={'remoteVideo'}
        autoPlay
        playsInline
        controls={false}
        ref={remoteVideoRef}
        width={800}
        height={800}
      />
    </div>
  );
}
