import React from "react";
import { Routes, Route } from 'react-router-dom';

import Login from './login.jsx';
import Administrator from './Bienvenido.jsx';
import NoRegistrado from './NoRegistrado.jsx';
import Canvas from './Canvas.jsx';

class BootstrapReact extends React.Component {

  render() {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/administrator" element={<Administrator />} />
          <Route path="/no-registrado" element={<NoRegistrado />} />
          <Route path="/canvas" element={<Canvas />} />
        </Routes>
      </div>
    );
  }
}

export default BootstrapReact;
