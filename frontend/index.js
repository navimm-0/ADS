import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './src/styles.css';

import BootstrapReac from './src/components/BootstrapReact.jsx';
import Administrator from './src/components/Administrator.jsx'; // create this

function Aplicacion() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<BootstrapReac />} />
        <Route path="/administrator" element={<Administrator />} />
      </Routes>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById('raiz'));
root.render(<Aplicacion />);
