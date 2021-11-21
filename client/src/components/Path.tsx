import { Link } from 'react-router-dom';

export function Path() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Link to={'/patientRoom'}>환자대기실 </Link>
      <Link to={'/doctorRoom'}>의사대기실 </Link>
    </div>
  );
}
