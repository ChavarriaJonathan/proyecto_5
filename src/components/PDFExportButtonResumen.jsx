import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import '../pages/PDFExportButton.css'; // Reutilizamos los estilos existentes

const PDFExportButtonResumen = ({ onClick }) => {
  return (
    <button className="pdf-export-button" onClick={onClick}>
      <FaFilePdf className="pdf-icon" />
      <span>Exportar Resumen a PDF</span>
    </button>
  );
};

export default PDFExportButtonResumen;