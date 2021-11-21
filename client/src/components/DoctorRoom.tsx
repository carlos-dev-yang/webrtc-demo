import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { IDoctor, IOfferCare, IPatient } from './type';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
import { SocketDomain } from './config';
const DOCTOR_INFO: IDoctor = {
  id: nanoid(),
  name: '의사 1번',
  socketId: '',
};

export function DoctorRoom() {
  const socketRef = useRef<Socket>();
  const [patientList, setPatientList] = useState<IPatient[]>([]);
  const [offerCareInfo, setOfferCareInfo] = useState<IOfferCare>();

  let navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(SocketDomain);
    const socket = socketRef.current;

    socket.on('getRequestPatientList', (getPatientList: IPatient[]) => {
      setPatientList(getPatientList);
    });

    socket.on('offerCare', (offerInfo: IOfferCare) => {
      setOfferCareInfo(offerInfo);
    });

    socket.on('reset', () => {
      socket.emit('joinDoctorRoom', DOCTOR_INFO);
    });

    socket.emit('joinDoctorRoom', DOCTOR_INFO);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleSocketEmit = (type: string, message: unknown) => {
    if (socketRef.current) {
      socketRef.current.emit(type, message);
    }
  };

  const createRequest = (id: string) => {
    const roomId = nanoid();
    handleSocketEmit('offerCare', {
      roomId,
      patientId: id,
      doctorId: DOCTOR_INFO.id,
    });
  };

  const handleJoinCareRoom = () => {
    if (offerCareInfo) {
      navigate('/doctorCareRoom', {
        state: { roomId: offerCareInfo?.roomId },
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      진료 요청 환자
      {patientList.map((patient) => {
        const handleRequestCall = () => {
          createRequest(patient.id);
        };
        const isOffered = DOCTOR_INFO.id === offerCareInfo?.doctorId;
        return (
          <div key={patient.id}>
            <span>{patient.name} / </span>
            <span>status: {patient.status} </span>
            {!isOffered ? (
              <button onClick={handleRequestCall}>진료 시작</button>
            ) : (
              <button onClick={handleJoinCareRoom}>진료실 입장</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
