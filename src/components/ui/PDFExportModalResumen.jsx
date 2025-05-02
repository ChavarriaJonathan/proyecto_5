import React, { useState } from 'react';
import { FaFilePdf, FaTimes, FaDownload, FaChartBar } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PDFExportModal.css'; // Reusing the existing styles

const PDFExportModalResumen = ({ isOpen, onClose, selectedEscenario, allEscenariosData }) => {
  const [selectedTables, setSelectedTables] = useState({
    resumenGeneral: true,
    proyectos: true,
    finanzas: true,
    comparativaAnios: true,
    escenarioComparativa: true,
    charts: true // Option for charts
  });

  const [pdfTitle, setPdfTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Configuración para controlar qué gráficas se procesan
  const [processedCharts, setProcessedCharts] = useState(new Set());

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
      escenarioComparativa: true,
      charts: true
    });
  };

  const handleDeselectAll = () => {
    setSelectedTables({
      resumenGeneral: false,
      proyectos: false,
      finanzas: false,
      comparativaAnios: false,
      escenarioComparativa: false,
      charts: false
    });
  };

  // Función mejorada para capturar gráficas
  const captureChartElement = async (element) => {
    if (!element) return null;
    
    try {
      // Capturar directamente usando html2canvas con alta calidad
      const canvas = await html2canvas(element, {
        scale: 2, // Alta resolución
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF'
      });
      
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error al capturar la gráfica:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    if (!Object.values(selectedTables).some(Boolean)) {
      setError('Por favor seleccione al menos una sección para incluir en el PDF');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    // Reiniciar el conjunto de gráficas procesadas
    setProcessedCharts(new Set());

    try {
      // Create a PDF instance
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 30;
      const contentWidth = pageWidth - (margin * 2);
      
      // Determine if we're showing the general summary or a specific scenario
      const isResumenGeneral = selectedEscenario.id_escenario === 'all';
      const title = pdfTitle || (isResumenGeneral ? 'Resumen General - Todos los Escenarios' : `Resumen - ${selectedEscenario.e_nombre}`);
      
      // Add title
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
      
      // ENFOQUE SIMPLIFICADO: Tratar las gráficas y los elementos por separado
      
      // 1. CAPTURAR ELEMENTOS SIN GRÁFICAS
      const captureElement = async (title, element) => {
        if (!element) return;
        
        // Ocultar temporalmente todas las gráficas dentro de este elemento
        const charts = element.querySelectorAll('.resumen-chart-container, .resumen-chart-wrapper');
        const chartStyles = [];
        
        charts.forEach(chart => {
          chartStyles.push({
            element: chart,
            display: chart.style.display
          });
          chart.style.display = 'none';
        });
        
        // Agregar título de sección
        pdf.setFontSize(14);
        pdf.setTextColor(97, 18, 50);
        pdf.text(title, margin, yPosition);
        yPosition += 25;
        
        // Capturar el elemento sin las gráficas
        try {
          const canvas = await html2canvas(element, {
            scale: 1.5,
            useCORS: true,
            backgroundColor: '#FFFFFF'
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          
          // Calcular el tamaño para mantener la proporción
          const imgWidth = contentWidth;
          const ratio = canvas.width / imgWidth;
          const imgHeight = canvas.height / ratio;
          
          // Comprobar si necesitamos una nueva página
          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Añadir imagen al PDF
          pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 20;
        } catch (error) {
          console.error('Error al capturar elemento:', error);
        }
        
        // Restaurar la visibilidad de las gráficas
        chartStyles.forEach(item => {
          item.element.style.display = item.display;
        });
      };
      
      // 2. CAPTURAR GRÁFICAS INDIVIDUALES
      const captureChart = async (chartElement) => {
        if (!chartElement) return;
        
        try {
          const chartImage = await captureChartElement(chartElement);
          if (!chartImage) return;
          
          // Crear una imagen para obtener dimensiones
          const img = new Image();
          img.src = chartImage;
          
          // Esperar a que la imagen cargue
          await new Promise(resolve => {
            img.onload = resolve;
          });
          
          // Calcular dimensiones para el PDF
          const imgWidth = contentWidth;
          const ratio = img.width / imgWidth;
          const imgHeight = img.height / ratio;
          
          // Comprobar si necesitamos una nueva página
          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Añadir imagen al PDF
          pdf.addImage(chartImage, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 20;
        } catch (error) {
          console.error('Error al capturar gráfica:', error);
        }
      };

      // IMPLEMENTACIÓN SEGÚN TIPO DE VISTA
      
      if (isResumenGeneral) {
        // PARA RESUMEN GENERAL (TODOS LOS ESCENARIOS)
        
        // 1. Si se seleccionaron tablas de comparación
        if (selectedTables.escenarioComparativa) {
          const sections = document.querySelectorAll('.escenario-table-container');
          
          for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const sectionTitle = section.querySelector('.escenario-name')?.textContent || `Escenario ${i+1}`;
            
            // Capturar el elemento sin gráficas
            await captureElement(`Comparativa: ${sectionTitle}`, section);
            
            // Si están seleccionadas las gráficas, capturarlas individualmente
            if (selectedTables.charts) {
              const charts = section.querySelectorAll('.resumen-chart-container');
              
              if (charts.length > 0) {
                pdf.setFontSize(12);
                pdf.setTextColor(97, 18, 50);
                pdf.text(`Gráficas de ${sectionTitle}:`, margin, yPosition);
                yPosition += 20;
                
                for (let j = 0; j < charts.length; j++) {
                  await captureChart(charts[j]);
                }
              }
            }
          }
        }
        
        // 2. Si sólo se seleccionaron gráficas
        else if (selectedTables.charts) {
          const allCharts = document.querySelectorAll('.resumen-chart-container');
          
          if (allCharts.length > 0) {
            pdf.setFontSize(14);
            pdf.setTextColor(97, 18, 50);
            pdf.text('Gráficas de Escenarios', margin, yPosition);
            yPosition += 25;
            
            for (let i = 0; i < allCharts.length; i++) {
              await captureChart(allCharts[i]);
            }
          }
        }
      } else {
        // PARA UN ESCENARIO ESPECÍFICO
        
        // 1. Capturar el resumen general si está seleccionado
        if (selectedTables.resumenGeneral) {
          const dashboardSection = document.querySelector('.resumen-grid');
          if (dashboardSection) {
            await captureElement('Resumen General', dashboardSection);
          }
        }
        
        // 2. Capturar tablas si están seleccionadas
        if (selectedTables.proyectos || selectedTables.finanzas) {
          // Buscar la tabla principal
          const tableElement = document.querySelector('.resumen-table');
          if (tableElement) {
            const tableParent = tableElement.closest('.card-body') || tableElement.parentElement;
            await captureElement('Tablas de Datos', tableParent);
          }
        }
        
        // 3. Capturar comparativa de años si está seleccionada
        if (selectedTables.comparativaAnios) {
          const comparativaSection = document.querySelector('.summary-container');
          if (comparativaSection) {
            await captureElement('Comparativa de Años', comparativaSection);
          }
        }
        
        // 4. Capturar las gráficas si están seleccionadas
        if (selectedTables.charts) {
          const charts = document.querySelectorAll('.resumen-chart-container');
          
          if (charts.length > 0) {
            pdf.setFontSize(14);
            pdf.setTextColor(97, 18, 50);
            pdf.text('Gráficas', margin, yPosition);
            yPosition += 25;
            
            for (let i = 0; i < charts.length; i++) {
              await captureChart(charts[i]);
            }
          }
        }
      }
      
      // Guardar el PDF
      pdf.save(`${title}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Determine if we're in the General Summary or a specific scenario
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
            {/* Chart option is available in both views */}
            <div className="pdf-checkbox-container">
              <input
                type="checkbox"
                id="charts"
                checked={selectedTables.charts}
                onChange={() => handleCheckboxChange('charts')}
              />
              <label htmlFor="charts">
                <FaChartBar style={{ marginRight: "5px" }} />
                Gráficas
              </label>
            </div>
            
            {isResumenGeneral ? (
              // Options for General Summary
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
              // Options for a specific scenario
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