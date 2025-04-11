import React, { useState } from 'react';
import { FaFilePdf, FaTimes, FaCheck, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PDFExportModal.css';

const PDFExportModal = ({ isOpen, onClose, selectedEscenario, convocatorias, aniosData, resumen1Data, resumen2Data }) => {
  const [selectedTables, setSelectedTables] = useState({
    escenarioData: true,
    convocatorias: true,
    resumenFinanciero: true,
    resumenProyectos: true,
    incrementoPresupuesto: true
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
      escenarioData: true,
      convocatorias: true,
      resumenFinanciero: true,
      resumenProyectos: true,
      incrementoPresupuesto: true
    });
  };

  const handleDeselectAll = () => {
    setSelectedTables({
      escenarioData: false,
      convocatorias: false,
      resumenFinanciero: false,
      resumenProyectos: false,
      incrementoPresupuesto: false
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
      temporaryContainer.style.width = '850px'; // Ligeramente más ancho que los 800px originales
      temporaryContainer.style.position = 'absolute';
      temporaryContainer.style.left = '-9999px';
      temporaryContainer.style.top = '-9999px';
      document.body.appendChild(temporaryContainer);

      // Clone the needed elements and add them to our temporary container
      if (selectedTables.escenarioData && aniosData.length > 0) {
        const escenarioTable = document.querySelector('.resumen-table');
        if (escenarioTable) {
          const tableClone = escenarioTable.cloneNode(true);
          
          // Reemplazar inputs con su texto
          const inputs = tableClone.querySelectorAll('input');
          inputs.forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
          });
          
          const titleDiv = document.createElement('div');
          titleDiv.className = 'pdf-section-title';
          titleDiv.textContent = 'Datos del Escenario';
          
          temporaryContainer.appendChild(titleDiv);
          temporaryContainer.appendChild(tableClone);
        }
      }

      if (selectedTables.convocatorias && convocatorias.length > 0) {
        const convocatoriaTables = document.querySelectorAll('.convocatoria-table');
        if (convocatoriaTables.length > 0) {
          const titleDiv = document.createElement('div');
          titleDiv.className = 'pdf-section-title';
          titleDiv.textContent = 'Convocatorias';
          temporaryContainer.appendChild(titleDiv);
          
          convocatoriaTables.forEach(table => {
            const tableClone = table.cloneNode(true);
            
            // Reemplazar inputs con su texto
            const inputs = tableClone.querySelectorAll('input');
            inputs.forEach(input => {
              const span = document.createElement('span');
              span.textContent = input.value;
              input.parentNode.replaceChild(span, input);
            });
            
            // Remover botones de guardar si existen
            const saveButtons = tableClone.querySelectorAll('.save-button');
            saveButtons.forEach(button => button.remove());
            
            temporaryContainer.appendChild(tableClone);
          });
        }
      }

      if (selectedTables.resumenFinanciero) {
        const resumen1Table = document.querySelector('.resumen1-table');
        if (resumen1Table) {
          const tableClone = resumen1Table.cloneNode(true);
          
          // Reemplazar inputs con su texto
          const inputs = tableClone.querySelectorAll('input');
          inputs.forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
          });
          
          const titleDiv = document.createElement('div');
          titleDiv.className = 'pdf-section-title';
          titleDiv.textContent = 'Resumen Financiero';
          
          temporaryContainer.appendChild(titleDiv);
          temporaryContainer.appendChild(tableClone);
        }
      }

      if (selectedTables.resumenProyectos) {
        const resumen2Table = document.querySelector('.resumen2-table');
        if (resumen2Table) {
          const tableClone = resumen2Table.cloneNode(true);
          
          // Reemplazar inputs con su texto
          const inputs = tableClone.querySelectorAll('input');
          inputs.forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
          });
          
          const titleDiv = document.createElement('div');
          titleDiv.className = 'pdf-section-title';
          titleDiv.textContent = 'Resumen Proyectos';
          
          temporaryContainer.appendChild(titleDiv);
          temporaryContainer.appendChild(tableClone);
        }
      }

      if (selectedTables.incrementoPresupuesto) {
        const incrementoCards = document.querySelector('.incremento-cards-container');
        if (incrementoCards) {
          const cardsClone = incrementoCards.cloneNode(true);
          
          // Reemplazar inputs con su texto
          const inputs = cardsClone.querySelectorAll('input');
          inputs.forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
          });
          
          // Ocultar sliders y botones de incremento
          const sliders = cardsClone.querySelectorAll('.slider-container, .porcentaje-input-container');
          sliders.forEach(slider => {
            slider.style.display = 'none';
          });
          
          const titleDiv = document.createElement('div');
          titleDiv.className = 'pdf-section-title';
          titleDiv.textContent = 'Incremento de Presupuesto';
          
          temporaryContainer.appendChild(titleDiv);
          temporaryContainer.appendChild(cardsClone);
        }
      }

      // Generate the PDF
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const title = pdfTitle || `Tablero Presión del Gasto - ${selectedEscenario.e_nombre}`;
      
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
      const margin = 30; // Reducido de 40 para dar más espacio a las tablas
      
      // Process each child element of the temporary container
      const elements = temporaryContainer.children;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Aplicar un factor de escala mayor para tablas
        const isTable = element.tagName === 'TABLE';
        const scale = isTable ? 1.4 : 1.3;
        
        const canvas = await html2canvas(element, {
          scale: scale,
          useCORS: true,
          logging: false
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
              placeholder={`Tablero Presión del Gasto - ${selectedEscenario.e_nombre}`}
            />
          </div>

          <div className="pdf-section-header">
            <h3>Seleccione las tablas a incluir:</h3>
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
            <div className="pdf-checkbox-container">
              <input
                type="checkbox"
                id="escenarioData"
                checked={selectedTables.escenarioData}
                onChange={() => handleCheckboxChange('escenarioData')}
              />
              <label htmlFor="escenarioData">Datos del Escenario</label>
            </div>
            
            <div className="pdf-checkbox-container">
              <input
                type="checkbox"
                id="convocatorias"
                checked={selectedTables.convocatorias}
                onChange={() => handleCheckboxChange('convocatorias')}
              />
              <label htmlFor="convocatorias">Convocatorias</label>
            </div>
            
            <div className="pdf-checkbox-container">
              <input
                type="checkbox"
                id="resumenFinanciero"
                checked={selectedTables.resumenFinanciero}
                onChange={() => handleCheckboxChange('resumenFinanciero')}
              />
              <label htmlFor="resumenFinanciero">Resumen Financiero</label>
            </div>
            
            <div className="pdf-checkbox-container">
              <input
                type="checkbox"
                id="resumenProyectos"
                checked={selectedTables.resumenProyectos}
                onChange={() => handleCheckboxChange('resumenProyectos')}
              />
              <label htmlFor="resumenProyectos">Resumen Proyectos</label>
            </div>
            
            <div className="pdf-checkbox-container">
              <input
                type="checkbox"
                id="incrementoPresupuesto"
                checked={selectedTables.incrementoPresupuesto}
                onChange={() => handleCheckboxChange('incrementoPresupuesto')}
              />
              <label htmlFor="incrementoPresupuesto">Incremento Presupuesto</label>
            </div>
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

export default PDFExportModal;