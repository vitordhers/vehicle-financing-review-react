import React from "react";
import "./Loader.css";

export const Loader: React.FC = () => {
  return (
    <div className="loader-overlay">
      <div className="loader"></div>
    </div>
  );
};
