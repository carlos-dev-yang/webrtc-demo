import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Call } from './components/Call';
import { DoctorCall } from './components/DoctorCall';
import { DoctorRoom } from './components/DoctorRoom';

import { Media } from './components/Media';
import { Path } from './components/Path';
import { PatientCall } from './components/PatientCall';
import { PatientRoom } from './components/PatientRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={'/'} element={<Path />} />
        <Route path={'/call'} element={<Call />} />
        <Route path={'/media'} element={<Media />} />
        <Route path={'/caller'} element={<DoctorCall />} />
        <Route path={'/patientCareRoom'} element={<PatientCall />} />
        <Route path={'/doctorCareRoom'} element={<DoctorCall />} />
        <Route path={'/patientRoom'} element={<PatientRoom />} />
        <Route path={'/doctorRoom'} element={<DoctorRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
