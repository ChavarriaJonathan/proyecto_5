import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PresionDelGasto from './pages/PresionDelGasto';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/PresionDelGasto" element={<PresionDelGasto />} />
      </Routes>
    </Router>
  );
}

export default App;
