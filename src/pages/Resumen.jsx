import React, { useState, useEffect, useRef } from 'react';
import { useEscenario } from '../context/EscenarioContext';
import SidebarResumen from '../components/layout/SidebarResumen';
import axios from 'axios';
import './Resumen.css';
import { FaExclamationTriangle } from 'react-icons/fa';
import PDFExportButtonResumen from '../components/ui/PDFExportButtonResumen';
import PDFExportModalResumen from '../components/ui/PDFExportModalResumen';

// Import our new components
import ResumenDashboard from './ResumenDashboard';
import ResumenProyectosTable from './ResumenProyectosTable';
import ResumenFinanzasTable from './ResumenFinanzasTable';
import ResumenAllEscenarios from './ResumenAllEscenarios';
import ResumenTabs from '../components/ui/ResumenTabs';
import ScrollToTopButton from '../components/ui/ScrollToTopButton';

const Resumen = () => {
  const { selectedEscenario, refreshTrigger } = useEscenario();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumenData, setResumenData] = useState(null);
  const [allEscenariosData, setAllEscenariosData] = useState([]);
  const [loadingAllEscenarios, setLoadingAllEscenarios] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  
  // Reference for scroll to top
  const topRef = useRef(null);

  useEffect(() => {
    if (selectedEscenario) {
      if (selectedEscenario.id_escenario === 'all') {
        fetchAllEscenariosData();
      } else {
        fetchResumenData();
      }
    }
  }, [selectedEscenario, refreshTrigger]);
  
  // Effect to detect scroll and show/hide the "back to top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Function to scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const fetchResumenData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost/proyecto_5/backend/Resumen/getResumenData.php?id_escenario=${selectedEscenario.id_escenario}`);
      
      if (response.data.success) {
        setResumenData(response.data.data);
      } else {
        setError('Error al cargar datos de resumen: ' + response.data.message);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resumen data:', error);
      setError('Error de conexión al servidor');
      setLoading(false);
    }
  };

  const fetchAllEscenariosData = async () => {
    try {
      setLoadingAllEscenarios(true);
      setError('');
      
      // First get the list of scenarios
      const escenariosResponse = await axios.get('http://localhost/proyecto_5/backend/sidebar/getEscenarios.php');
      
      if (escenariosResponse.data.success) {
        const escenarios = escenariosResponse.data.data;
        const escenariosDataPromises = escenarios.map(escenario => 
          axios.get(`http://localhost/proyecto_5/backend/Resumen/getResumenData.php?id_escenario=${escenario.id_escenario}`)
        );
        
        const escenariosResults = await Promise.all(escenariosDataPromises);
        const escenariosData = escenariosResults
          .filter(response => response.data.success)
          .map(response => response.data.data);
        
        setAllEscenariosData(escenariosData);
      } else {
        setError('Error al cargar la lista de escenarios');
      }
      
      setLoadingAllEscenarios(false);
    } catch (error) {
      console.error('Error fetching all escenarios data:', error);
      setError('Error de conexión al servidor');
      setLoadingAllEscenarios(false);
    }
  };

  const renderContent = () => {
    if (loading || loadingAllEscenarios) {
      return <div className="loading">Cargando datos de resumen...</div>;
    }

    if (error) {
      return (
        <div className="error">
          <FaExclamationTriangle style={{ marginRight: "10px" }} />
          {error}
        </div>
      );
    }

    if (!selectedEscenario) {
      return (
        <div className="no-selection">
          <p>Selecciona un escenario en la barra lateral para visualizar el resumen</p>
        </div>
      );
    }

    // If "Show all scenarios" is selected
    if (selectedEscenario.id_escenario === 'all') {
      return (
        <div className="card">
          <div className="card-header">
            <div>Comparativa de Todos los Escenarios</div>
          </div>
          <div className="card-body">
            <ResumenAllEscenarios 
              allEscenariosData={allEscenariosData} 
              loadingAllEscenarios={loadingAllEscenarios}
            />
          </div>
        </div>
      );
    }

    // Normal rendering for an individual scenario
    return (
      <div className="card">
        <div className="card-header">
          <div>Escenario: {resumenData?.escenario.e_nombre}</div>
        </div>
        <div className="card-body">
          <ResumenTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {activeTab === 'dashboard' && <ResumenDashboard resumenData={resumenData} />}
          {activeTab === 'proyectos' && <ResumenProyectosTable resumenData={resumenData} />}
          {activeTab === 'finanzas' && <ResumenFinanzasTable resumenData={resumenData} />}
        </div>
      </div>
    );
  };

  return (
    <div className="resumen-container">
      <SidebarResumen />
      <div className="resumen-content" ref={topRef}>
        <h1>Resumen Escenarios</h1>
        {renderContent()}
        
        <ScrollToTopButton 
          showScrollTop={showScrollTop && selectedEscenario && selectedEscenario.id_escenario === 'all'} 
          scrollToTop={scrollToTop} 
        />

        {selectedEscenario && <PDFExportButtonResumen onClick={() => setIsPDFModalOpen(true)} />}
        <PDFExportModalResumen 
          isOpen={isPDFModalOpen} 
          onClose={() => setIsPDFModalOpen(false)} 
          selectedEscenario={selectedEscenario}
          allEscenariosData={allEscenariosData}
        />
      </div>
    </div>
  );
};

export default Resumen;