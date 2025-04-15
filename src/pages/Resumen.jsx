import React, { useState, useEffect, useRef } from 'react';
import { useEscenario } from './EscenarioContext';
import SidebarResumen from './SidebarResumen';
import axios from 'axios';
import './Resumen.css';
import { FaFileAlt, FaChartPie, FaProjectDiagram, FaMoneyBillWave, FaExclamationTriangle, FaListUl, FaArrowUp } from 'react-icons/fa';
import PDFExportButtonResumen from '../components/PDFExportButtonResumen';
import PDFExportModalResumen from '../components/PDFExportModalResumen';

const Resumen = () => {
  const { selectedEscenario, refreshTrigger } = useEscenario();
  
  // Cambiado el valor inicial a 'dashboard' en lugar de 'proyectos'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumenData, setResumenData] = useState(null);
  const [allEscenariosData, setAllEscenariosData] = useState([]);
  const [loadingAllEscenarios, setLoadingAllEscenarios] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  
  // Referencia para hacer scroll al inicio
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
  
  // Efecto para detectar el scroll y mostrar/ocultar el botón de "volver arriba"
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
  
  // Función para hacer scroll hacia arriba
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
      
      // Primero obtenemos la lista de escenarios
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

  const renderProyectosTable = () => {
    if (!resumenData || !resumenData.años || resumenData.años.length === 0) {
      return <div className="error">No hay datos disponibles</div>;
    }

    return (
      <div className="table-container">
        <table className="resumen-table">
          <thead>
            <tr>
              <th>Concepto</th>
              {resumenData.años.map(año => (
                <th key={`year-${año.id_año}`} className="year-column">
                  {año.año}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row-header">Proyectos Presión</td>
              {resumenData.años.map(año => (
                <td key={`pp-${año.id_año}`}>
                  {año.proyectos_presion.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Proyectos por Comprometer</td>
              {resumenData.años.map(año => (
                <td key={`pc-${año.id_año}`}>
                  {año.proyectos_comprometer.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Total Proyectos</td>
              {resumenData.años.map(año => (
                <td key={`tp-${año.id_año}`} className="highlight">
                  {año.total_proyectos.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Incremento Presupuestal</td>
              {resumenData.años.map(año => (
                <td key={`ip-${año.id_año}`}>
                  {año.incremento_porcentaje_formatted}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderFinanzasTable = () => {
    if (!resumenData || !resumenData.años || resumenData.años.length === 0) {
      return <div className="error">No hay datos disponibles</div>;
    }

    return (
      <div className="table-container">
        <table className="resumen-table">
          <thead>
            <tr>
              <th>Concepto</th>
              {resumenData.años.map(año => (
                <th key={`year-${año.id_año}`} className="year-column">
                  {año.año}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row-header">Presupuesto Bruto</td>
              {resumenData.años.map(año => (
                <td key={`pb-${año.id_año}`}>
                  {año.presupuesto_bruto_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Presión del Gasto Real</td>
              {resumenData.años.map(año => (
                <td key={`pgr-${año.id_año}`}>
                  {año.presion_gasto_real_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Presupuesto por Comprometer</td>
              {resumenData.años.map(año => (
                <td key={`pc-${año.id_año}`}>
                  {año.presupuesto_comprometer_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Presión del Gasto Proyectada</td>
              {resumenData.años.map(año => (
                <td key={`pgp-${año.id_año}`}>
                  {año.presion_gasto_proyectada_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Monto Total Comprometido</td>
              {resumenData.años.map(año => (
                <td key={`mtc-${año.id_año}`} className="highlight">
                  {año.monto_total_comprometido_formatted}
                </td>
              ))}
            </tr>
            <tr>
              <td className="row-header">Déficit o Superávit por Comprometer</td>
              {resumenData.años.map(año => {
                const isPositive = año.deficit >= 0;
                return (
                  <td 
                    key={`def-${año.id_año}`}
                    className={isPositive ? 'deficit-positive' : 'deficit-negative'}
                  >
                    {año.deficit_formatted}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!resumenData || !resumenData.años || resumenData.años.length === 0) {
      return <div className="error">No hay datos disponibles</div>;
    }

    // Tomar el último año para mostrar información relevante
    const ultimoAño = resumenData.años[resumenData.años.length - 1];
    const primerAño = resumenData.años[0];
    
    return (
      <>
        <h3 className="section-header"><FaChartPie /> Resumen General</h3>
        <div className="resumen-grid">
          <div className="stat-card">
            <div className="stat-title">Convocatorias</div>
            <div className="stat-value">{resumenData.escenario.num_convocatorias}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Años Analizados</div>
            <div className="stat-value">{resumenData.años.length}</div>
          </div>
        </div>

        <h3 className="section-header">Tabla Unificada de Proyectos y Finanzas</h3>
        <div className="table-container">
          <table className="resumen-table">
            <thead>
              <tr>
                <th>Concepto</th>
                {resumenData.años.map(año => (
                  <th key={`year-${año.id_año}`} className="year-column">
                    {año.año}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Sección de Proyectos */}
              <tr>
                <td colSpan={resumenData.años.length + 1} className="section-row">
                  <FaProjectDiagram style={{ marginRight: "5px" }} /> PROYECTOS
                </td>
              </tr>
              <tr>
                <td className="row-header">Proyectos Presión</td>
                {resumenData.años.map(año => (
                  <td key={`pp-${año.id_año}`}>
                    {año.proyectos_presion.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Proyectos por Comprometer</td>
                {resumenData.años.map(año => (
                  <td key={`pc-${año.id_año}`}>
                    {año.proyectos_comprometer.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Total Proyectos</td>
                {resumenData.años.map(año => (
                  <td key={`tp-${año.id_año}`} className="highlight">
                    {año.total_proyectos.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Incremento Presupuestal</td>
                {resumenData.años.map(año => (
                  <td key={`ip-${año.id_año}`}>
                    {año.incremento_porcentaje_formatted}
                  </td>
                ))}
              </tr>
              
              {/* Sección de Finanzas */}
              <tr>
                <td colSpan={resumenData.años.length + 1} className="section-row">
                  <FaMoneyBillWave style={{ marginRight: "5px" }} /> FINANZAS
                </td>
              </tr>
              <tr>
                <td className="row-header">Presupuesto Bruto</td>
                {resumenData.años.map(año => (
                  <td key={`pb-${año.id_año}`}>
                    {año.presupuesto_bruto_formatted}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Presión del Gasto Real</td>
                {resumenData.años.map(año => (
                  <td key={`pgr-${año.id_año}`}>
                    {año.presion_gasto_real_formatted}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Presupuesto por Comprometer</td>
                {resumenData.años.map(año => (
                  <td key={`ppc-${año.id_año}`}>
                    {año.presupuesto_comprometer_formatted}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Presión del Gasto Proyectada</td>
                {resumenData.años.map(año => (
                  <td key={`pgp-${año.id_año}`}>
                    {año.presion_gasto_proyectada_formatted}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Monto Total Comprometido</td>
                {resumenData.años.map(año => (
                  <td key={`mtc-${año.id_año}`} className="highlight">
                    {año.monto_total_comprometido_formatted}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-header">Déficit o Superávit por Comprometer</td>
                {resumenData.años.map(año => {
                  const isPositive = año.deficit >= 0;
                  return (
                    <td 
                      key={`def-${año.id_año}`}
                      className={isPositive ? 'deficit-positive' : 'deficit-negative'}
                    >
                      {año.deficit_formatted}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="summary-container">
          <h3 className="summary-title">Comparativa {primerAño.año} vs {ultimoAño.año}</h3>
          <div className="resumen-grid">
            <div className="stat-card">
              <div className="stat-title">Incremento en Total de Proyectos</div>
              <div className="stat-value">
                {ultimoAño.total_proyectos > primerAño.total_proyectos 
                  ? '+' + (ultimoAño.total_proyectos - primerAño.total_proyectos).toLocaleString()
                  : (ultimoAño.total_proyectos - primerAño.total_proyectos).toLocaleString()}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Incremento en Presupuesto Bruto</div>
              <div className="stat-value">
                {ultimoAño.presupuesto_bruto > primerAño.presupuesto_bruto 
                  ? '+' + ((ultimoAño.presupuesto_bruto - primerAño.presupuesto_bruto) / primerAño.presupuesto_bruto * 100).toFixed(1) + '%'
                  : ((ultimoAño.presupuesto_bruto - primerAño.presupuesto_bruto) / primerAño.presupuesto_bruto * 100).toFixed(1) + '%'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Cambio en Déficit/Superávit</div>
              <div className={`stat-value ${ultimoAño.deficit > primerAño.deficit ? 'deficit-positive' : 'deficit-negative'}`}>
                ${Math.abs(ultimoAño.deficit - primerAño.deficit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                {ultimoAño.deficit > primerAño.deficit ? ' (mejora)' : ' (deterioro)'}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Nuevo renderizado para todos los escenarios
  const renderAllEscenarios = () => {
    if (loadingAllEscenarios) {
      return <div className="loading">Cargando datos de todos los escenarios...</div>;
    }

    if (allEscenariosData.length === 0) {
      return <div className="error">No hay datos disponibles para los escenarios</div>;
    }
    
    return (
      <>
        <h3 className="section-header"><FaListUl /> Todos los Escenarios</h3>
        
        {allEscenariosData.map((escenarioData, index) => (
          <div key={`escenario-${index}`} className="escenario-table-container">
            <h3 className="escenario-name">
              <span className="escenario-number">{index + 1}.</span> 
              {escenarioData.escenario.e_nombre}
            </h3>
            
            {/* Mini panel de estadísticas para este escenario */}
            <div className="escenario-stats-panel">
              <div className="resumen-grid">
                <div className="stat-card">
                  <div className="stat-title">Número de Convocatorias</div>
                  <div className="stat-value">{escenarioData.escenario.num_convocatorias}</div>
                </div>
                {escenarioData.años && escenarioData.años.length > 0 && (
                  <div className="stat-card">
                    <div className="stat-title">Años Analizados</div>
                    <div className="stat-value">{escenarioData.años.length}</div>
                  </div>
                )}
              </div>
            </div>
            
            {escenarioData.años && escenarioData.años.length > 0 ? (
              <div className="table-container">
                <table className="resumen-table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      {escenarioData.años.map(año => (
                        <th key={`year-${año.id_año}`} className="year-column">
                          {año.año}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sección de Proyectos */}
                    <tr>
                      <td colSpan={escenarioData.años.length + 1} className="section-row">
                        <FaProjectDiagram style={{ marginRight: "5px" }} /> PROYECTOS
                      </td>
                    </tr>
                    <tr>
                      <td className="row-header">Proyectos Presión</td>
                      {escenarioData.años.map(año => (
                        <td key={`pp-${año.id_año}`}>
                          {año.proyectos_presion.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Proyectos por Comprometer</td>
                      {escenarioData.años.map(año => (
                        <td key={`pc-${año.id_año}`}>
                          {año.proyectos_comprometer.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Total Proyectos</td>
                      {escenarioData.años.map(año => (
                        <td key={`tp-${año.id_año}`} className="highlight">
                          {año.total_proyectos.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Incremento Presupuestal</td>
                      {escenarioData.años.map(año => (
                        <td key={`ip-${año.id_año}`}>
                          {año.incremento_porcentaje_formatted}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Sección de Finanzas */}
                    <tr>
                      <td colSpan={escenarioData.años.length + 1} className="section-row">
                        <FaMoneyBillWave style={{ marginRight: "5px" }} /> FINANZAS
                      </td>
                    </tr>
                    <tr>
                      <td className="row-header">Presupuesto Bruto</td>
                      {escenarioData.años.map(año => (
                        <td key={`pb-${año.id_año}`}>
                          {año.presupuesto_bruto_formatted}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Presión del Gasto Real</td>
                      {escenarioData.años.map(año => (
                        <td key={`pgr-${año.id_año}`}>
                          {año.presion_gasto_real_formatted}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Presupuesto por Comprometer</td>
                      {escenarioData.años.map(año => (
                        <td key={`ppc-${año.id_año}`}>
                          {año.presupuesto_comprometer_formatted}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Presión del Gasto Proyectada</td>
                      {escenarioData.años.map(año => (
                        <td key={`pgp-${año.id_año}`}>
                          {año.presion_gasto_proyectada_formatted}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Monto Total Comprometido</td>
                      {escenarioData.años.map(año => (
                        <td key={`mtc-${año.id_año}`} className="highlight">
                          {año.monto_total_comprometido_formatted}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-header">Déficit o Superávit por Comprometer</td>
                      {escenarioData.años.map(año => {
                        const isPositive = año.deficit >= 0;
                        return (
                          <td 
                            key={`def-${año.id_año}`}
                            className={isPositive ? 'deficit-positive' : 'deficit-negative'}
                          >
                            {año.deficit_formatted}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="error">No hay datos disponibles para este escenario</div>
            )}
          </div>
        ))}
        
        <div className="escenarios-summary">
          <h3 className="section-header">Resumen General</h3>
          <div className="resumen-grid">
            <div className="stat-card">
              <div className="stat-title">Total de Escenarios</div>
              <div className="stat-value">{allEscenariosData.length}</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Función para encontrar un año común para comparar entre escenarios
  const findCommonYear = (escenariosData) => {
    // Crear un contador de años
    const yearCount = {};
    
    // Contar la frecuencia de cada año
    escenariosData.forEach(escenarioData => {
      escenarioData.años.forEach(año => {
        yearCount[año.año] = (yearCount[año.año] || 0) + 1;
      });
    });
    
    // Encontrar el año más reciente que aparece en al menos la mitad de los escenarios
    const years = Object.keys(yearCount)
      .map(year => parseInt(year))
      .filter(year => yearCount[year] >= escenariosData.length / 2)
      .sort((a, b) => b - a); // Ordenar de más reciente a más antiguo
    
    return years.length > 0 ? years[0] : (
      // Si no hay un año común, tomar el más reciente de todos
      Math.max(...escenariosData.flatMap(e => e.años.map(a => a.año)))
    );
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

    // Si se seleccionó "Mostrar todos los escenarios"
    if (selectedEscenario.id_escenario === 'all') {
      return (
        <div className="card">
          <div className="card-header">
            <div>Comparativa de Todos los Escenarios</div>
          </div>
          <div className="card-body">
            {renderAllEscenarios()}
          </div>
        </div>
      );
    }

    // Renderizado normal para un escenario individual
    return (
      <div className="card">
        <div className="card-header">
          <div>Escenario: {resumenData?.escenario.e_nombre}</div>
        </div>
        <div className="card-body">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaChartPie style={{ marginRight: "5px" }} /> Dashboard
            </div>
            <div 
              className={`tab ${activeTab === 'proyectos' ? 'active' : ''}`}
              onClick={() => setActiveTab('proyectos')}
            >
              <FaProjectDiagram style={{ marginRight: "5px" }} /> Proyectos
            </div>
            <div 
              className={`tab ${activeTab === 'finanzas' ? 'active' : ''}`}
              onClick={() => setActiveTab('finanzas')}
            >
              <FaMoneyBillWave style={{ marginRight: "5px" }} /> Finanzas
            </div>
          </div>
          
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'proyectos' && renderProyectosTable()}
          {activeTab === 'finanzas' && renderFinanzasTable()}
        </div>
      </div>
    );
  };

  return (
    <div className="resumen-container">
      <SidebarResumen />
      <div className="resumen-content" ref={topRef}>
        <h1> Resumen Escenarios</h1>
        {renderContent()}
        {showScrollTop && selectedEscenario && selectedEscenario.id_escenario === 'all' && (
          <div className="scroll-to-top" onClick={scrollToTop}>
            <FaArrowUp />
          </div>
        )}

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