import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Administrator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let incomingAlert = location.state && location.state.alerta ? location.state.alerta : null;

  // obtener usuario y tipo desde location.state o localStorage
  let usuario = location.state && location.state.usuario ? location.state.usuario : null;
  let tipoUsuario = location.state && location.state.tipo ? location.state.tipo : null;

  if (!usuario) {
    try { usuario = localStorage.getItem('usuario'); } catch (e) { usuario = null; }
  }
  if (!tipoUsuario) {
    try { tipoUsuario = localStorage.getItem('tipoUsuario'); } catch (e) { tipoUsuario = null; }
  }
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
      const t = setTimeout(() => {
        setToast(false);
        try { localStorage.removeItem('alerta'); } catch (e) {}
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [incomingAlert]);

  const API_URL = 'http://localhost:8080/crud';
  const [lista, setLista] = useState([]);

  const cargarDatos = async () => {
    try {
      const resp = await fetch(API_URL);
      const data = await resp.json();
      setLista(data);
    } catch (error) {
      console.error('Error cargando diagramas:', error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const verItem = (item) => {
    const url = item?.datos?.url;
    if (url) window.open(url, '_blank', 'noopener');
    else alert('No hay vista previa disponible');
  };

  const editarItem = (item) => {
    // Navegar a la pantalla de administrador pasando el item para editar
    navigate('/canvas', { state: { usuario, tipo: tipoUsuario, mode: 'edit', itemToEdit: item } });
  };

  const eliminarItem = async (item) => {
    if (!window.confirm('¿Eliminar diagrama?')) return;
    try {
      await fetch(`${API_URL}?id=${item.id_db}`, { method: 'DELETE' });
      cargarDatos();
    } catch (e) {
      console.error('Error eliminando:', e);
      alert('Error al eliminar');
    }
  };

  const crearDiagrama = () => {
    // Ajusta esta ruta a donde realmente está tu editor/creador de diagramas
    navigate('/canvas', { state: { usuario, tipo: tipoUsuario, mode: 'create' } });
  };

  return (
    <div>
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {toast && incomingAlert && (
          <div
            className={`toast align-items-center text-bg-${incomingAlert.tipo} border-0 show`}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{incomingAlert.texto}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToast(false)}
              ></button>
            </div>
          </div>
        )}
      </div>

      <div className="container py-5">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Bienvenido {usuario || ''}</h1>
            {tipoUsuario && <p className="text-muted mb-0">Tipo de usuario: {tipoUsuario}</p>}
          </div>

          <button type="button" className="btn btn-crear-diagrama" onClick={crearDiagrama}>
            <i className="bi bi-plus-circle me-2" aria-hidden="true" ></i>
            Crear diagrama
          </button>

        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h2 className="h5 mb-0">Diagramas Guardados</h2>
          </div>

          <div className="card-body">
            <div className="row">
              {lista.length === 0 && (
                <div className="col-12">
                  <p className="text-muted">No hay diagramas guardados.</p>
                </div>
              )}

              {lista.map((item) => (
                <div className="col-md-4 mb-4" key={item.id_db}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{item.datos?.titulo || 'Sin título'}</h5>

                      {item.datos?.url && (
                        <img
                          src={item.datos.url}
                          className="img-fluid mb-2 rounded border"
                          alt={item.datos.titulo || ''}
                        />
                      )}

                      {item.datos?.descripcion && (
                        <p className="card-text">{item.datos.descripcion}</p>
                      )}
                    </div>
                    <div className="card-footer d-flex justify-content-end gap-2">
                      <button className="btn btn-sm btn-ver" title="Ver" onClick={() => verItem(item)}>
                        <i className="bi bi-eye me-1" aria-hidden="true"></i> Ver
                      </button>

                      <button className="btn btn-sm btn-editar" title="Editar" onClick={() => editarItem(item)}>
                        <i className="bi bi-pencil-square me-1" aria-hidden="true"></i> Editar
                      </button>

                      <button className="btn btn-sm btn-eliminar" title="Eliminar" onClick={() => eliminarItem(item)}>
                        <i className="bi bi-trash me-1" aria-hidden="true"></i> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Administrator;
