import React from 'react';
import { FaListUl, FaProjectDiagram, FaMoneyBillWave } from 'react-icons/fa';
import ResumenChart from './ResumenChart';

const ResumenAllEscenarios = ({ allEscenariosData, loadingAllEscenarios }) => {
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
            <>
              {/* Add the chart for each scenario */}
              <ResumenChart resumenData={escenarioData} />
              
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
            </>
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

export default ResumenAllEscenarios;