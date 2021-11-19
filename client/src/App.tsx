import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Call } from './components/Call';
import { IO } from './components/IO';

import { Media } from './components/Media';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={'/'} element={<Media />} />
        <Route path={'/call'} element={<Call />} />
        <Route path={'/io'} element={<IO />} />
      </Routes>
    </Router>
  );
}

export default App;
