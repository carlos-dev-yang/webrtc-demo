import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Call } from './components/Call';
import { Caller } from './components/Caller';
import { IO } from './components/IO';

import { Media } from './components/Media';
import { Path } from './components/Path';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={'/'} element={<Path />} />
        <Route path={'/call'} element={<Call />} />
        <Route path={'/media'} element={<Media />} />
        <Route path={'/io'} element={<IO />} />
        <Route path={'/caller'} element={<Caller />} />
      </Routes>
    </Router>
  );
}

export default App;
