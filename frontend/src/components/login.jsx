import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setAlerta(null);

    try {
      const resp = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({ usuario, password }).toString(),
      });

      if (!resp.ok) throw new Error('Error de red: ' + resp.status);

      const data = await resp.json();

      if (data.status === 'OK' || data.ok || data.tipo) {
        // usuario válido
        const tipo = data.tipo || data.tipoUsuario || 'usuario';
        const alertaObj = { tipo: 'success', texto: 'USUARIO VÁLIDO' };
        setAlerta(alertaObj);
        // persistir alerta y datos para que la página destino los muestre como toast
        try { localStorage.setItem('alerta', JSON.stringify(alertaObj)); } catch (e) {}
        try { localStorage.setItem('usuario', usuario); } catch (e) {}
        try { localStorage.setItem('tipoUsuario', tipo); } catch (e) {}
        // redirigir según tipo
        if (tipo.toLowerCase() === 'administrador' || tipo.toLowerCase() === 'admin') {
          navigate('/administrator', { state: { usuario, tipo, alerta: alertaObj } });
        } else {
          // usuario válido pero no admin: llevar a administrador igualmente o a otra ruta
          navigate('/administrator', { state: { usuario, tipo, alerta: alertaObj } });
        }
      } else {
        // usuario inválido / no registrado
        const alertaObj = { tipo: 'danger', texto: data.mensaje || 'USUARIO INVÁLIDO' };
        setAlerta(alertaObj);
        try { localStorage.setItem('alerta', JSON.stringify(alertaObj)); } catch (e) {}
        // redirigir a la página de no registrado con estado
        navigate('/no-registrado', { state: { alerta: alertaObj } });
      }
    } catch (err) {
      const alertaObj = { tipo: 'warning', texto: 'No se pudo conectar con el servidor. Detalle: ' + err.message };
      setAlerta(alertaObj);
      try { localStorage.setItem('alerta', JSON.stringify(alertaObj)); } catch (e) {}
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center min-vh-100">
      <div className="login-overlay" />
      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="login-card card shadow-lg p-4 p-md-5">
              <div className="text-center mb-3">
                <h1 className="h4 fw-bold mb-1 login-title">Sistema de Login</h1>
                <p className="text-muted mb-0">Ingresa con tu usuario y contraseña</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="usuario" className="form-label">Usuario</label>
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
                  <label htmlFor="password" className="form-label">Contraseña</label>
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

                <button type="submit" className="btn btn-pastel w-100 mt-2" disabled={cargando}>
                  {cargando ? 'Verificando...' : 'Ingresar'}
                </button>
              </form>

              {alerta && (
                <div className={`alert alert-${alerta.tipo} mt-3 mb-0`} role="alert">
                  {alerta.texto}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
