import React from "react";
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './login.jsx';
import Administrator from './Administrator.jsx';
import NoRegistrado from './NoRegistrado.jsx';

class BootstrapReact extends React.Component {

  render() {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/administrator" element={<Administrator />} />
          <Route path="/no-registrado" element={<NoRegistrado />} />
        </Routes>
      </div>
    );
  }
}

export default BootstrapReact;
