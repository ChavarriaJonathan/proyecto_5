import React, { useState } from 'react';
import { FaFilePdf, FaTimes, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../components/PDFExportModal.css'; // Reutilizamos los estilos existentes

const PDFExportModalResumen = ({ isOpen, onClose, selectedEscenario, allEscenariosData }) => {
  const [selectedTables, setSelectedTables] = useState({
    resumenGeneral: true,
    proyectos: true,
    finanzas: true,
    comparativaAnios: true,
    escenarioComparativa: true
  });

  const [pdfTitle, setPdfTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = (key) => {
    setSelectedTables((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectAll = () => {
    setSelectedTables({
      resumenGeneral: true,
      proyectos: true,
      finanzas: true,
      comparativaAnios: true,
      escenarioComparativa: true
    });
  };

  const handleDeselectAll = () => {
    setSelectedTables({
      resumenGeneral: false,
      proyectos: false,
      finanzas: false,
      comparativaAnios: false,
      escenarioComparativa: false
    });
  };

  const generatePDF = async () => {
    if (!Object.values(selectedTables).some(Boolean)) {
      setError('Por favor seleccione al menos una tabla para incluir en el PDF');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Create a container to hold the elements we want to capture
      const temporaryContainer = document.createElement('div');
      temporaryContainer.style.width = '850px';
      temporaryContainer.style.position = 'absolute';
      temporaryContainer.style.left = '-9999px';
      temporaryContainer.style.top = '-9999px';
      temporaryContainer.style.backgroundColor = 'white';
      document.body.appendChild(temporaryContainer);

      // Determinar qué elementos capturar basándonos en si es Resumen General o un escenario específico
      const isResumenGeneral = selectedEscenario.id_escenario === 'all';

      if (isResumenGeneral) {
        // Para el caso de "Resumen General" (todos los escenarios)
        if (selectedTables.escenarioComparativa) {
          // Capturar la comparativa de escenarios
          const escenariosTables = document.querySelectorAll('.escenario-table-container');
          if (escenariosTables.length > 0) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'pdf-section-title';
            titleDiv.textContent = 'Comparativa de Escenarios';
            temporaryContainer.appendChild(titleDiv);
            
            escenariosTables.forEach(table => {
              const tableClone = table.cloneNode(true);
              temporaryContainer.appendChild(tableClone);
            });
          }
        }
      } else {
        // Para un escenario específico
        // Capturar Dashboard/Resumen General
        if (selectedTables.resumenGeneral) {
          const dashboardSection = document.querySelector('.resumen-grid');
          if (dashboardSection) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'pdf-section-title';
            titleDiv.textContent = 'Resumen General';
            
            const dashboardClone = dashboardSection.cloneNode(true);
            
            temporaryContainer.appendChild(titleDiv);
            temporaryContainer.appendChild(dashboardClone);
          }
        }
        
        // Capturar Tabla Unificada (contiene proyectos y finanzas)
        const unifiedTable = document.querySelector('.resumen-table');
        if (unifiedTable) {
          const tableClone = unifiedTable.cloneNode(true);
          
          // Crear un contenedor para la tabla
          const tableContainer = document.createElement('div');
          tableContainer.style.marginBottom = '20px';
          tableContainer.style.padding = '15px';
          tableContainer.appendChild(tableClone);
          
          const titleDiv = document.createElement('div');
          titleDiv.className = 'pdf-section-title';
          titleDiv.textContent = `Resumen de Datos - ${selectedEscenario.e_nombre}`;
          
          temporaryContainer.appendChild(titleDiv);
          temporaryContainer.appendChild(tableContainer);
        }
        
        // Capturar Comparativa de Años
        if (selectedTables.comparativaAnios) {
          const comparativaSection = document.querySelector('.summary-container');
          if (comparativaSection) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'pdf-section-title';
            titleDiv.textContent = 'Comparativa de Años';
            
            const comparativaClone = comparativaSection.cloneNode(true);
            
            temporaryContainer.appendChild(titleDiv);
            temporaryContainer.appendChild(comparativaClone);
          }
        }
      }

      // Generate the PDF
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const title = pdfTitle || (isResumenGeneral ? 'Resumen General - Todos los Escenarios' : `Resumen - ${selectedEscenario.e_nombre}`);
      
      pdf.setFontSize(16);
      pdf.setTextColor(97, 18, 50); // #611232
      pdf.text(title, pageWidth / 2, 40, { align: 'center' });
      
      // Add current date
      const currentDate = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generado: ${currentDate}`, pageWidth - 30, 20, { align: 'right' });
      
      let yPosition = 60;
      const margin = 30;
      
      // Process each child element of the temporary container
      const elements = temporaryContainer.children;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Aplicar un factor de escala mayor para tablas
        const isTable = element.tagName === 'TABLE' || element.querySelector('table');
        const scale = isTable ? 1.4 : 1.3;
        
        const canvas = await html2canvas(element, {
          scale: scale,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Calculate image width and height to fit the page
        const imgWidth = pageWidth - (margin * 2);
        const ratio = canvas.width / imgWidth;
        const imgHeight = canvas.height / ratio;
        
        // Check if we need a new page
        if (yPosition + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20; // Add some space between elements
      }
      
      // Remove the temporary container
      document.body.removeChild(temporaryContainer);
      
      // Save the PDF
      pdf.save(`${title}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Determinar si estamos en el Resumen General o en un escenario específico
  const isResumenGeneral = selectedEscenario.id_escenario === 'all';

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-container">
        <div className="pdf-modal-header">
          <h2><FaFilePdf /> Exportar a PDF</h2>
          <button className="pdf-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="pdf-modal-body">
          <div className="pdf-title-input">
            <label htmlFor="pdfTitle">Título del PDF:</label>
            <input
              type="text"
              id="pdfTitle"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              placeholder={isResumenGeneral ? 'Resumen General - Todos los Escenarios' : `Resumen - ${selectedEscenario.e_nombre}`}
            />
          </div>

          <div className="pdf-section-header">
            <h3>Seleccione las secciones a incluir:</h3>
            <div className="pdf-select-actions">
              <button className="pdf-select-all" onClick={handleSelectAll}>
                Seleccionar Todos
              </button>
              <button className="pdf-deselect-all" onClick={handleDeselectAll}>
                Deseleccionar Todos
              </button>
            </div>
          </div>

          <div className="pdf-table-options">
            {isResumenGeneral ? (
              // Opciones para Resumen General
              <div className="pdf-checkbox-container">
                <input
                  type="checkbox"
                  id="escenarioComparativa"
                  checked={selectedTables.escenarioComparativa}
                  onChange={() => handleCheckboxChange('escenarioComparativa')}
                />
                <label htmlFor="escenarioComparativa">Comparativa de Escenarios</label>
              </div>
            ) : (
              // Opciones para un escenario específico
              <>
                <div className="pdf-checkbox-container">
                  <input
                    type="checkbox"
                    id="resumenGeneral"
                    checked={selectedTables.resumenGeneral}
                    onChange={() => handleCheckboxChange('resumenGeneral')}
                  />
                  <label htmlFor="resumenGeneral">Resumen General</label>
                </div>
                
                <div className="pdf-checkbox-container">
                  <input
                    type="checkbox"
                    id="proyectos"
                    checked={selectedTables.proyectos}
                    onChange={() => handleCheckboxChange('proyectos')}
                  />
                  <label htmlFor="proyectos">Datos de Proyectos</label>
                </div>
                
                <div className="pdf-checkbox-container">
                  <input
                    type="checkbox"
                    id="finanzas"
                    checked={selectedTables.finanzas}
                    onChange={() => handleCheckboxChange('finanzas')}
                  />
                  <label htmlFor="finanzas">Datos Financieros</label>
                </div>
                
                <div className="pdf-checkbox-container">
                  <input
                    type="checkbox"
                    id="comparativaAnios"
                    checked={selectedTables.comparativaAnios}
                    onChange={() => handleCheckboxChange('comparativaAnios')}
                  />
                  <label htmlFor="comparativaAnios">Comparativa entre Años</label>
                </div>
              </>
            )}
          </div>

          {error && <div className="pdf-error-message">{error}</div>}

          <div className="pdf-actions">
            <button className="pdf-cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="pdf-generate-btn" 
              onClick={generatePDF}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generando...' : (
                <>
                  <FaDownload /> Generar y Descargar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFExportModalResumen;