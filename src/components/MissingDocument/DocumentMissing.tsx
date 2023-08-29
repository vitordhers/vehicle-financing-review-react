import React from "react";
import "./DocumentMissing.css";
import { Typography } from "@mui/material";

export const DocumentMissing: React.FC = () => {
  return (
    <div className="document-missing">
      <h1>Não achamos seu Documento</h1>
      <Typography component={"p"} variant={"body2"}>
        O Documento solicitado não foi encontrado ou não existe.
      </Typography>
    </div>
  );
};
