import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './src/styles.css';

import BootstrapReact from './src/components/BootstrapReact.jsx';

function Aplicacion() {
  return (
    <HashRouter>
      <BootstrapReact />
    </HashRouter>
  );
}

const root = createRoot(document.getElementById('raiz'));
root.render(<Aplicacion />);
