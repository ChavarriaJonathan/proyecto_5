import React from 'react';

const ResumenFinanzasTable = ({ resumenData }) => {
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

export default ResumenFinanzasTable;