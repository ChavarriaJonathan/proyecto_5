import React from 'react';
import { FaChartPie, FaProjectDiagram, FaMoneyBillWave } from 'react-icons/fa';
import ResumenChart from '../components/common/ResumenChart';
import '../components/common/ResumenChart.css';

const ResumenDashboard = ({ resumenData }) => {
  if (!resumenData || !resumenData.años || resumenData.años.length === 0) {
    return <div className="error">No hay datos disponibles</div>;
  }

  // Tomar el último año para mostrar información relevante
  const ultimoAño = resumenData.años[resumenData.años.length - 1];
  const primerAño = resumenData.años[0];
  
  return (
    <>
      <h3 className="section-header"><FaChartPie /> Resumen General</h3>
      
      {/* Chart component - now placed first in the Resumen General section */}
      <ResumenChart resumenData={resumenData} />
      
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

export default ResumenDashboard;