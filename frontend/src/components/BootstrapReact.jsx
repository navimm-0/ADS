// src/componentes/BootstrapReact.jsx
import React, { useState } from 'react';

const BootstrapReac = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setAlerta(null);

    try {
      const resp = await fetch(
        'http://localhost:8080/GraficadorDFMBackend/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: new URLSearchParams({
            usuario,
            password,
          }).toString(),
        }
      );

      if (!resp.ok) {
        throw new Error('Error de red: ' + resp.status);
      }

      const data = await resp.json();

      if (data.ok) {
        // Éxito: el backend regresa ok=true, mensaje y tipoUsuario
        let msg = data.mensaje || 'Inicio de sesión correcto';
        if (data.tipoUsuario) {
          msg += ` (tipo: ${data.tipoUsuario})`;
        }

        setAlerta({
          tipo: 'success',
          texto: msg,
        });

      } else {
        // Error de credenciales u otro mensaje del backend
        setAlerta({
          tipo: 'danger',
          texto: data.mensaje || 'Usuario o contraseña incorrectos',
        });
        setUsuario('');   // limpiar campo usuario
        setPassword('');  // limpiar campo contraseña
      }
    } catch (err) {
      setAlerta({
        tipo: 'warning',
        texto:
          'No se pudo conectar con el servidor. Detalle: ' + err.message,
      });
      setUsuario('');   // limpiar campo usuario
      setPassword('');  // limpiar campo contraseña
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center min-vh-100">
      {/* Capa difuminada */}
      <div className="login-overlay" />

      {/* Contenido principal */}
      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="login-card card shadow-lg p-4 p-md-5">
              <div className="text-center mb-3">
                <h1 className="h4 fw-bold mb-1 login-title">
                  Sistema de Login
                </h1>
                <p className="text-muted mb-0">
                  Ingresa con tu usuario y contraseña
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="usuario" className="form-label">
                    Usuario
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="usuario"
                    placeholder="Ingresa tu usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-pastel w-100 mt-2"
                  disabled={cargando}
                >
                  {cargando ? 'Verificando...' : 'Ingresar'}
                </button>
              </form>

              {alerta && (
                <div
                  className={`alert alert-${alerta.tipo} mt-3 mb-0`}
                  role="alert"
                >
                  {alerta.texto}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootstrapReac;
