import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { PC_CONFIG } from './config';

// const socket = io('http://localhost:8080');
export function Caller() {
  const socketRef = useRef<Socket>();
  const pcRef = useRef<RTCPeerConnection>();

  useEffect(() => {
    socketRef.current = io('http://localhost:8080');
    pcRef.current = new RTCPeerConnection(PC_CONFIG);

    const socket = socketRef.current;
    socket.on('connect', () => {
      console.log(socket.id);
    });

    socket.on('getOffer', (sdp) => {
      console.log('get offer from caller', sdp);
    });

    socket.on('disconnect', () => {
      console.log(socket.id);
    });

    socket.on('getCandidate', async (candidate: RTCIceCandidateInit) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('candidate add success');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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
