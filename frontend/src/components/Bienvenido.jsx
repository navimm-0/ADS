// src/components/Bienvenido.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Bienvenido = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Datos que mandamos desde el login
  const { usuario = 'usuario', tipoUsuario } = location.state || {};

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Bienvenido {usuario}</h1>
        {tipoUsuario && (
          <p className="text-muted mb-0">Tipo de usuario: {tipoUsuario}</p>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h2 className="h5 mb-0">Tabla de ejemplo</h2>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Campo</th>
                  <th scope="col">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Usuario</td>
                  <td>{usuario}</td>
                </tr>
                {tipoUsuario && (
                  <tr>
                    <td>2</td>
                    <td>Tipo de usuario</td>
                    <td>{tipoUsuario}</td>
                  </tr>
                )}
                <tr>
                  <td>{tipoUsuario ? 3 : 2}</td>
                  <td>Estado</td>
                  <td>Sesión iniciada correctamente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate('/')}
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Bienvenido;
