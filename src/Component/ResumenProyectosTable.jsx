import React from 'react';

const ResumenProyectosTable = ({ resumenData }) => {
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

export default ResumenProyectosTable;