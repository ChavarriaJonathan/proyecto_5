import React from 'react';
import { FaChartPie, FaProjectDiagram, FaMoneyBillWave } from 'react-icons/fa';

const ResumenTabs = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default ResumenTabs;