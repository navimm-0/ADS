import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

const API_CONTEXT = "GraficadorDFMBackend";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(
        `http://localhost:8080/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: new URLSearchParams({
            usuario,
            password
          }).toString()
        }
      );

      const data = await respuesta.json();

      if (data.ok) {
        setTipoMensaje("success");
        setMensaje(`Acceso concedido. ${data.mensaje}`);
      } else {
        setTipoMensaje("danger");
        setMensaje(data.mensaje);
        setUsuario("");
        setPassword("");
      }
    } catch (error) {
      setTipoMensaje("danger");
      setMensaje("Error de comunicación con el servidor.");
      setUsuario("");
      setPassword("");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page bg-app">
      <div className="login-overlay"></div>

      <div className="container h-100 d-flex align-items-center justify-content-center">
        <div className="row login-card shadow-lg">
          <div className="col-md-6 info-panel d-none d-md-flex flex-column justify-content-between">
            <div>
              <h2 className="project-title">
                Graficador de Diagramas
                <br />
                de Flujo Multimedia
              </h2>
              <p className="project-subtitle">
                Aplicación web para diseñar diagramas de flujo integrando{" "}
                <strong>MP3, MP4 y JPG</strong>.
              </p>

              <ul className="feature-list">
                <li>Narraciones MP3 en cada paso.</li>
                <li>Clips MP4 vinculados a procesos.</li>
                <li>Imágenes JPG para decisiones/estados.</li>
              </ul>
            </div>

            <div className="small text-muted">
              Proyecto académico · ESCOM IPN
            </div>
          </div>

          <div className="col-md-6 form-panel d-flex align-items-center">
            <div className="w-100">
              <h3 className="text-center mb-3">Inicio de sesión</h3>
              <p className="text-center text-muted small mb-4">
                Accede al graficador usando las credenciales asignadas.
              </p>

              {mensaje && (
                <div className={`alert alert-${tipoMensaje}`} role="alert">
                  {mensaje}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">ID de usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ejemplo: admin"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={cargando}
                >
                  {cargando ? "Validando..." : "Iniciar sesión"}
                </button>
              </form>

              <p className="text-muted mt-3 mb-0 small text-center">
                <strong>Usuario de prueba:</strong> admin &nbsp; | &nbsp;
                <strong>Password:</strong> 1234
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
