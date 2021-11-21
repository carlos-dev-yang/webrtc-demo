export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface IPatient {
  id: string;
  socketId: string;
  name: string;
  status?: 'waiting' | 'requested' | 'caring';
}

export interface IDoctor {
  id: string;
  socketId: string;
  name: string;
  status?: 'waiting' | 'requested' | 'caring';
}

export interface IRequested {
  patientId: string;
  doctorId: string;
}

export interface IRooms {
  [key: string]: string[];
}

export interface SocketRoom {
  [key: string]: string;
}

export interface IOfferCare {
  roomId: string;
  patientId: string;
  doctorId: string;
}
