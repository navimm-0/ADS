import React from "react";
import { Routes, Route } from 'react-router-dom';

import Login from './login.jsx';
import Administrator from './Bienvenido.jsx';
import NoRegistrado from './NoRegistrado.jsx';
import Canvas from './Canvas.jsx';
import CanvasViewer from "./CanvasViewer.jsx";

class BootstrapReact extends React.Component {

  render() {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/administrator" element={<Administrator />} />
          <Route path="/no-registrado" element={<NoRegistrado />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/canvas/view" element={<CanvasViewer />} />
        </Routes>
      </div>
    );
  }
}

export default BootstrapReact;
