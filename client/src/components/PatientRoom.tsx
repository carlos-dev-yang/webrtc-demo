import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { IDoctor, IOfferCare, IPatient, IRequested } from './type';
import { useNavigate } from 'react-router-dom';
import { SocketDomain } from './config';
import { nanoid } from 'nanoid';

const PATIENT_INFO: IPatient = {
  id: nanoid(),
  name: '환자 1번',
  socketId: '',
};
export function PatientRoom() {
  const socketRef = useRef<Socket>();
  const [doctorList, setDoctorList] = useState<IDoctor[]>([]);
  const [offerCareInfo, setOfferCareInfo] = useState<IOfferCare>();

  let navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(SocketDomain);
    const socket = socketRef.current;

    socket.on('getDoctorList', (getDoctorList: IDoctor[]) => {
      setDoctorList(getDoctorList);
    });

    socket.on('offerCare', (offerInfo: IOfferCare) => {
      setOfferCareInfo(offerInfo);
    });

    socket.on('reset', () => {
      socket.emit('joinPatientRoom', PATIENT_INFO);
    });

    socket.emit('joinPatientRoom', PATIENT_INFO);

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
    const requestCareInfo: IRequested = {
      patientId: PATIENT_INFO.id,
      doctorId: id,
    };
    handleSocketEmit('requestCare', requestCareInfo);
  };

  const handleResetSocket = () => {
    handleSocketEmit('reset', '');
    setOfferCareInfo(undefined);
  };

  const handleOfferConfirm = () => {
    if (offerCareInfo) {
      navigate('/patientCareRoom', {
        state: { roomId: offerCareInfo?.roomId },
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      진료 가능 의사
      {doctorList.map((doctor) => {
        const handleRequestCall = () => {
          createRequest(doctor.id);
        };
        const isOffered = doctor.id === offerCareInfo?.doctorId;
        return (
          <div key={doctor.id}>
            <span>{doctor.name} / </span>
            {!isOffered ? (
              <button onClick={handleRequestCall}>진료 요청</button>
            ) : (
              <button onClick={handleOfferConfirm}>진료 수락</button>
            )}
          </div>
        );
      })}
      <button style={{ marginTop: '100px' }} onClick={handleResetSocket}>
        reset
      </button>
    </div>
  );
}
