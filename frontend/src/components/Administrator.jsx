
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Administrator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let incomingAlert = location.state && location.state.alerta ? location.state.alerta : null;
  if (!incomingAlert) {
    try {
      const raw = localStorage.getItem('alerta');
      if (raw) incomingAlert = JSON.parse(raw);
    } catch (e) { incomingAlert = null; }
  }
  const [toast, setToast] = useState(!!incomingAlert);

  useEffect(() => {
    if (incomingAlert) {
      setToast(true);
      const t = setTimeout(() => { setToast(false); try { localStorage.removeItem('alerta'); } catch (e) {} }, 3000);
      return () => clearTimeout(t);
    }
  }, [incomingAlert]);

  return (
    <div>
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {toast && incomingAlert && (
          <div className={`toast align-items-center text-bg-${incomingAlert.tipo} border-0 show`} role="alert" aria-live="polite" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">{incomingAlert.texto}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setToast(false)}></button>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Administrator;

