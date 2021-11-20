import { useRef } from 'react';
import { IPC } from './type';

const PC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

export function Call() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  let localStream: MediaStream;
  let pc1: IPC;
  let pc2: IPC;

  const handleStartCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log('received local stream');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localStream = stream;
      }
    } catch (e) {
      console.log('getUserMedia error', e);
    }
  };

  const onCreateOfferSuccess = async (desc: RTCSessionDescriptionInit) => {
    console.log(`Offer from pc1\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    try {
      await pc1?.setLocalDescription(desc);
      onSetLocalSuccess(pc1);
    } catch (e) {
      onSetSessionDescriptionError();
    }

    console.log('pc2 setRemoteDescription start');
    try {
      await pc2?.setRemoteDescription(desc);
      onSetRemoteSuccess(pc2);
    } catch (e) {
      onSetSessionDescriptionError();
    }

    console.log('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    try {
      const answer = await pc2?.createAnswer();
      if (answer) {
        await onCreateAnswerSuccess(answer);
      }
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  };

  const onCreateAnswerSuccess = async (desc: RTCSessionDescriptionInit) => {
    console.log(`Answer from pc2:\n${desc?.sdp}`);
    console.log('pc2 setLocalDescription start');
    try {
      await pc2?.setLocalDescription(desc);
      onSetLocalSuccess(pc2);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
    console.log('pc1 setRemoteDescription start');
    try {
      await pc1?.setRemoteDescription(desc);
      onSetRemoteSuccess(pc1);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
  };

  const onCreateSessionDescriptionError = (error: unknown) => {
    console.log(`Failed to create session description: ${error}`);
  };

  const onSetLocalSuccess = (pc: IPC) => {
    console.log(`${getName(pc)} setLocalDescription complete`);
  };

  const onSetRemoteSuccess = (pc: IPC) => {
    console.log(`${getName(pc)} setRemoteDescription complete`);
  };

  const onSetSessionDescriptionError = (error?: unknown) => {
    console.log(`Failed to set session description: ${error}`);
  };

  const getName = (pc: IPC) => (pc === pc1 ? 'pc1' : 'pc2');
  const getOtherPc = (pc: IPC) => (pc === pc1 ? pc2 : pc1);

  const onAddIceCandidateSuccess = (pc: IPC) =>
    console.log(`${getName(pc)} addIceCandidate success`);

  const onAddIceCandidateError = (
    pc: IPC,
    error: RTCPeerConnectionIceErrorEvent
  ) => {
    console.log(
      `${getName(pc)} failed to add ICE Candidate: ${error.toString()}`
    );
  };

  const onIceStateChange = (pc: IPC, event: Event) => {
    if (pc) {
      console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
      console.log('ICE state change event: ', event);
    }
  };

  const gotRemoteStream = (e: RTCTrackEvent) => {
    if (
      remoteVideoRef.current &&
      remoteVideoRef.current.srcObject !== e.streams[0]
    ) {
      remoteVideoRef.current.srcObject = e.streams[0];
      console.log('pc2 received remote stream');
    }
  };

  const onIceCandidate = async (pc: IPC, event: RTCPeerConnectionIceEvent) => {
    try {
      await getOtherPc(pc)?.addIceCandidate(event.candidate as RTCIceCandidate);
      onAddIceCandidateSuccess(pc);
    } catch (e: unknown) {
      onAddIceCandidateError(pc, e as RTCPeerConnectionIceErrorEvent);
    }
    console.log(
      `${getName(pc)} ICE candidate:\n${
        event.candidate ? event.candidate.candidate : '(null)'
      }`
    );
  };

  const handleStartRemote = async () => {
    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();

    if (videoTracks.length) {
      console.log(`Using video device: ${videoTracks[0].label}`);
    }

    if (audioTracks.length) {
      console.log(`Using video device: ${videoTracks[0].label}`);
    }

    const configuration = {};

    pc1 = new RTCPeerConnection(configuration);
    pc2 = new RTCPeerConnection(configuration);

    console.log('pc1', pc1);
    console.log('pc2', pc2);

    console.log('Created local peer connection object pc1');
    pc1.addEventListener('icecandidate', (e) => onIceCandidate(pc1, e));
    pc2 = new RTCPeerConnection(configuration);
    console.log('Created remote peer connection object pc2');
    pc2.addEventListener('icecandidate', (e) => onIceCandidate(pc2, e));
    pc1.addEventListener('iceconnectionstatechange', (e: Event) =>
      onIceStateChange(pc1, e)
    );
    pc2.addEventListener('iceconnectionstatechange', (e) =>
      onIceStateChange(pc2, e)
    );
    pc2.addEventListener('track', gotRemoteStream);

    localStream
      .getTracks()
      .forEach((track) => pc1?.addTrack(track, localStream));
    console.log('Added local stream to pc1');

    try {
      console.log('pc1 createOffer start');
      const offer = await pc1.createOffer(offerOptions);
      await onCreateOfferSuccess(offer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  };

  const handleEndCall = () => {
    console.log('end call');
    pc1?.close();
    pc2?.close();
    pc1 = null;
    pc2 = null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button onClick={handleStartCall}>start</button>
      <button onClick={handleStartRemote}>remote Start</button>
      <button onClick={handleEndCall}>start</button>
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
        width={800}
        height={800}
      />
    </div>
  );
}
