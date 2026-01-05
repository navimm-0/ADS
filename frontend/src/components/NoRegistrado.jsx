import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NoRegistrado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let incoming = location.state && location.state.alerta ? location.state.alerta : null;
  if (!incoming) {
    try {
      const raw = localStorage.getItem('alerta');
      if (raw) incoming = JSON.parse(raw);
    } catch (e) { incoming = null; }
  }
  const [toast, setToast] = useState(!!incoming);

  useEffect(() => {
    if (incoming) {
      setToast(true);
      const t = setTimeout(() => { setToast(false); try { localStorage.removeItem('alerta'); } catch (e) {} }, 3000);
      return () => clearTimeout(t);
    }
  }, [incoming]);

  return (
    <div>
      {/* Toast container */}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {toast && incoming && (
          <div className={`toast align-items-center text-bg-${incoming.tipo} border-0 show`} role="alert" aria-live="polite" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">{incoming.texto}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setToast(false)}></button>
            </div>
          </div>
        )}
      </div>

      <div className="container py-5 d-flex justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center">
              <h1 className="display-6 fw-bold text-danger">USUARIO NO REGISTRADO EN LA APLICACIÓN WEB</h1>
              <p className="text-muted mt-3">Por favor verifica tus credenciales y vuelve a intentarlo</p>

              <button
                className="btn btn-pastel w-100 mt-2"
                onClick={() => navigate('/')}
              >
                Regresar al Login para volver a intentarlo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoRegistrado;
