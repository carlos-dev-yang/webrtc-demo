export const PC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19305'],
    },
  ],
};

export const SocketDomain = `http://${window.location.hostname}:8080`;
