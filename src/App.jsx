import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner'; // Importar Toaster de sonner
import Navbar from './components/Navbar';
import Home from './components/Home';
import PresionDelGastoWithContext from './pages/PresionDelGastoWithContext';
import Resumen from './pages/Resumen';
import { EscenarioProvider } from './pages/EscenarioContext';

function App() {
  return (
    <Router>
      <EscenarioProvider>
        {/* Añadir el componente Toaster aquí */}
        <Toaster 
          position="top-right" // Posición de las notificaciones (opciones: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
          richColors // Colores mejorados para los tipos de toast (success, error, etc.)
          toastOptions={{
            // Opciones por defecto para todos los toasts
            duration: 3000, // Duración en ms
            className: 'toast-custom', // Clase CSS personalizada (opcional)
            style: {
              // Estilos personalizados (opcional)
              fontFamily: '"Noto Sans", Sans-serif',
              fontSize: '14px',
            },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/PresionDelGasto" element={<PresionDelGastoWithContext />} />
          <Route path="/Resumen" element={<Resumen />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </EscenarioProvider>
    </Router>
  );
}

export default App;