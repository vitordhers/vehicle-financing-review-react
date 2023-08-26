import React from "react";
import "./DocumentMissing.css";

export const DocumentMissing: React.FC = () => {
  return (
    <div className="document-missing">
      <h1>Não achamos seu Documento</h1>
      <p>O Documento solicitado não foi encontrado ou não existe.</p>
    </div>
  );
};
