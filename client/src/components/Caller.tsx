import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { PC_CONFIG } from './config';

// const socket = io('http://localhost:8080');
export function Caller() {
  const socketRef = useRef<Socket>();
  const pcRef = useRef<RTCPeerConnection>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const setVideoTracks = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      if (!(pcRef.current && socketRef.current)) {
        return;
      }
      stream.getTracks().forEach((track) => {
        if (!pcRef.current) return;
        pcRef.current.addTrack(track, stream);
      });
      pcRef.current.oniceconnectionstatechange = (e) => {
        console.log(e);
      };
      pcRef.current.onicecandidate = (e) => {
        console.log('will create ice candidate');
        if (e.candidate) {
          if (!socketRef.current) return;
          console.log('onicecandidate');
          socketRef.current.emit('candidate', e.candidate);
        }
      };
      pcRef.current.ontrack = (ev) => {
        console.log('add remotetrack success');
        if (remoteVideoRef.current) {
          console.log('will connect remote ref');
          remoteVideoRef.current.srcObject = ev.streams[0];
        }
      };
      socketRef.current.emit('join_room', '1234');
    } catch (e) {
      console.error(e);
    }
  };

  const createOffer = async () => {
    if (!(pcRef.current && socketRef.current)) return;
    try {
      const sdp = await pcRef.current.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true,
      });
      await pcRef.current.setLocalDescription(new RTCSessionDescription(sdp));
      socketRef.current.emit('offer', sdp);
    } catch (e) {
      console.error(e);
    }
  };

  const createAnswer = async (sdp: RTCSessionDescription) => {
    if (!(pcRef.current && socketRef.current)) return;
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log('answer set remote description success');
      const mySdp = await pcRef.current.createAnswer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true,
      });
      console.log('create answer');
      await pcRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
      socketRef.current.emit('answer', mySdp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    socketRef.current = io('http://localhost:8080');
    pcRef.current = new RTCPeerConnection(PC_CONFIG);

    const socket = socketRef.current;

    socket.on('all_users', (allUsers: Array<string>) => {
      if (allUsers.length > 0) {
        createOffer();
      }
    });

    socket.on('getOffer', (sdp: RTCSessionDescription) => {
      createAnswer(sdp);
    });

    socket.on('getAnswer', (sdp: RTCSessionDescription) => {
      if (!pcRef.current) return;
      pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on('getCandidate', async (candidate: RTCIceCandidateInit) => {
      if (!pcRef.current) return;
      console.log('get candidate', candidate);
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('candidate add success');
    });

    socket.on('disconnect', () => {
      console.log('disconnect', socket.id);
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

  return (
    <div>
      <button onClick={() => setVideoTracks()}>test</button>
      <video
        id={'localVideo'}
        autoPlay
        playsInline
        controls={false}
        ref={localVideoRef}
        width={800}
        height={800}
      />
      <video
        id={'remoteVideo'}
        autoPlay
        playsInline
        controls={false}
        ref={remoteVideoRef}
        width={200}
        height={200}
      />
    </div>
  );
}
