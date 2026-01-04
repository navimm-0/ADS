// src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css'
import BootstrapReac from './components/BootstrapReact.jsx';
import Bienvenido from './components/Bienvenido.jsx';

class Aplicacion extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <BootstrapReac />
      </BrowserRouter>
    );
  }
}

export default Aplicacion;

const root = createRoot(document.getElementById('raiz'));
root.render(<Aplicacion />);