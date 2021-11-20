import { Link } from 'react-router-dom';

export function Path() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Link to={'/caller'}>Caller </Link>
      <Link to={'/callee'}>Callee </Link>
    </div>
  );
}
