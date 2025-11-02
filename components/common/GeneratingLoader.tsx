import React from 'react';
import './GeneratingLoader.css';

const GeneratingLoader: React.FC = () => {
  return (
    <div className="generating-loader-wrapper">
      <div className="generating-loader-container">
        <span className="generating-loader-letter">G</span>
        <span className="generating-loader-letter">e</span>
        <span className="generating-loader-letter">n</span>
        <span className="generating-loader-letter">e</span>
        <span className="generating-loader-letter">r</span>
        <span className="generating-loader-letter">a</span>
        <span className="generating-loader-letter">t</span>
        <span className="generating-loader-letter">i</span>
        <span className="generating-loader-letter">n</span>
        <span className="generating-loader-letter">g</span>
        <div className="generating-loader" />
      </div>
    </div>
  );
};

export default GeneratingLoader;

