import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PresionDelGastoWithContext from './pages/PresionDelGastoWithContext';
import { EscenarioProvider } from './pages/EscenarioContext';

function App() {
  return (
    <Router>
      <EscenarioProvider>
        <Navbar />
        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/PresionDelGasto" element={<PresionDelGastoWithContext />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </EscenarioProvider>
    </Router>
  );
}

export default App;