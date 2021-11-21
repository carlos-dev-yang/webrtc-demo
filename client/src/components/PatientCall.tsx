import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { PC_CONFIG, SocketDomain } from './config';

export function PatientCall() {
  const socketRef = useRef<Socket>();
  const pcRef = useRef<RTCPeerConnection>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  let location = useLocation();
  let navigate = useNavigate();
  const { state } = location;

  const handleBackToRoom = () => {
    navigate('/patientRoom');
  };
  if (!state?.roomId) {
    handleBackToRoom();
  }

  const setVideoTracks = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
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
        if (e.candidate) {
          if (!socketRef.current) return;
          socketRef.current.emit('candidate', e.candidate);
        }
      };
      pcRef.current.ontrack = (ev) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = ev.streams[0];
        }
      };
      socketRef.current.emit('join_room', state.roomId);
    } catch (e) {
      console.error(e);
    }
  };

  const createOffer = async () => {
    if (!(pcRef.current && socketRef.current)) return;
    try {
      const sdp = await pcRef.current.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
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
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
      console.log('create answer');
      await pcRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
      socketRef.current.emit('answer', mySdp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    socketRef.current = io(SocketDomain);
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button onClick={setVideoTracks}>test</button>
      <button onClick={handleBackToRoom}>방으로 되돌아가기</button>
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
