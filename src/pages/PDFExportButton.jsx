import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import './PDFExportButton.css';

const PDFExportButton = ({ onClick }) => {
  return (
    <button className="pdf-export-button" onClick={onClick}>
      <FaFilePdf className="pdf-icon" />
      <span>Exportar a PDF</span>
    </button>
  );
};

export default PDFExportButton;