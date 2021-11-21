export type IPC = RTCPeerConnection | null;

export interface IDoctor {
  id: string;
  socketId: string;
  name: string;
  status?: 'waiting' | 'requested' | 'caring';
}

export interface IPatient {
  id: string;
  socketId: string;
  name: string;
  status?: 'waiting' | 'requested' | 'caring';
}

export interface IRequested {
  patientId: string;
  doctorId: string;
}

export interface IOfferCare {
  roomId: string;
  patientId: string;
  doctorId: string;
}
