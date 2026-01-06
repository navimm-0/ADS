// src/componentes/Canvas.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

const API_URL = 'http://localhost:8080/crud';

// --- ESTILOS ---
const textAreaStyle = {
  width: '100%',
  height: '100%',
  border: 'none',
  background: 'transparent',
  resize: 'none',
  textAlign: 'center',
  fontSize: '11px',
  fontFamily: 'sans-serif',
  outline: 'none',
  padding: '2px',
  boxSizing: 'border-box',
  lineHeight: '1.2',
  pointerEvents: 'all',
};

// --- NODOS PERSONALIZADOS ---

const StandardNode = ({ id, data, isConnectable }) => {
  return (
    <div
      style={{
        ...data.customStyle,
        width: '120px',
        height: '60px',
        position: 'relative',
        border: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', height: '15px', background: 'rgba(0,0,0,0.1)', cursor: 'grab' }}></div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <textarea
          className="nodrag"
          value={data.label}
          onChange={(evt) => data.onChange(id, evt.target.value)}
          style={textAreaStyle}
        />
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

const DecisionNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          width: '70px',
          height: '70px',
          background: '#fff',
          border: '2px solid #555',
          transform: 'rotate(45deg)',
          zIndex: -1,
          borderRadius: '4px',
        }}
      />
      <div style={{ width: '50px', height: '50px', zIndex: 1 }}>
        <textarea
          className="nodrag"
          value={data.label}
          onChange={(evt) => data.onChange(id, evt.target.value)}
          style={textAreaStyle}
        />
      </div>
      <Handle type="target" position={Position.Top} style={{ top: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="r" style={{ right: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ bottom: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} id="l" style={{ left: 15, background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

const InputOutputNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{ position: 'relative', width: '140px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          width: '120px',
          height: '100%',
          background: '#ADD8E6',
          border: '1px solid #333',
          transform: 'skew(-20deg)',
          zIndex: -1,
          borderRadius: '4px',
        }}
      />
      <div style={{ width: '110px', height: '100%', display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        <div style={{ width: '100%', height: '15px', cursor: 'grab', borderBottom: '1px solid rgba(0,0,0,0.1)' }}></div>
        <div style={{ flex: 1 }}>
          <textarea
            className="nodrag"
            value={data.label}
            onChange={(evt) => data.onChange(id, evt.target.value)}
            style={textAreaStyle}
          />
        </div>
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

const MultimediaNode = ({ id, data, isConnectable }) => {
  const esImagen = data.mediaUrl && data.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  const esVideo = data.mediaUrl && data.mediaUrl.match(/\.(mp4|webm)$/i) != null;
  const esAudio = data.mediaUrl && data.mediaUrl.match(/\.(mp3|wav)$/i) != null;

  return (
    <div
      style={{
        width: '160px',
        minHeight: '100px',
        background: '#fff',
        border: '2px dashed #007bff',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '20px',
          background: '#007bff',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'white', fontSize: '10px' }}>Multimedia</span>
      </div>

      <div style={{ flex: 1, padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <input
          className="nodrag form-control form-control-sm mb-2"
          placeholder="Pega URL (img/mp3/mp4)"
          value={data.mediaUrl || ''}
          onChange={(evt) => data.onMediaChange(id, evt.target.value)}
          style={{ fontSize: '9px', padding: '2px' }}
        />

        {esImagen && <img src={data.mediaUrl} alt="media" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px' }} />}
        {esVideo && <video src={data.mediaUrl} controls style={{ maxWidth: '100%', maxHeight: '100px' }} />}
        {esAudio && <audio src={data.mediaUrl} controls style={{ width: '100%', height: '30px' }} />}

        <textarea
          className="nodrag"
          value={data.label}
          onChange={(evt) => data.onChange(id, evt.target.value)}
          style={{ ...textAreaStyle, height: '20px', marginTop: '5px', fontSize: '10px' }}
          placeholder="Etiqueta..."
        />
      </div>

      <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

const nodeTypes = {
  standard: StandardNode,
  decision: DecisionNode,
  io: InputOutputNode,
  multimedia: MultimediaNode,
};

const compressDataUrl = async (dataUrl, {
    mime = 'image/jpeg',   // 'image/webp' también sirve
    quality = 0.6,         // 0.4-0.8 recomendado
    maxWidth = 1200,       // reduce resolución
    } = {}) => {
    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    const scale = Math.min(1, maxWidth / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');

    // fondo blanco para JPEG (evita fondo negro si hay transparencia)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.drawImage(img, 0, 0, w, h);

    return canvas.toDataURL(mime, quality);
};


const Canvas = ({ usuario, tipo, mode = 'create', itemToEdit = null, onSaved = null }) => {
    const navigate = useNavigate();
    const regresar = () => {
        navigate('/administrator', { state: { usuario, tipo } });
    };
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [form, setForm] = useState({ titulo: '', descripcion: '', tipo: 'jpg', url: '' });

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const reactFlowWrapper = useRef(null);
    const [rfInstance, setRfInstance] = useState(null);

    const [toastInfo, setToastInfo] = useState({ show: false, tipo: 'success', texto: '' });
    const [dirty, setDirty] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    const showToast = (texto, tipo = 'success') => {
    setToastInfo({ show: true, tipo, texto });
    setTimeout(() => setToastInfo((t) => ({ ...t, show: false })), 2500);
    };

    const onNodeLabelChange = useCallback((nodeId, newLabel) => {
        setNodes((nds) =>
        nds.map((n) => {
            if (n.id === nodeId) return { ...n, data: { ...n.data, label: newLabel } };
            return n;
        })
        );
    }, [setNodes]);

    const onNodeMediaChange = useCallback((nodeId, newUrl) => {
        setNodes((nds) =>
        nds.map((n) => {
            if (n.id === nodeId) return { ...n, data: { ...n.data, mediaUrl: newUrl } };
            return n;
        })
        );
    }, [setNodes]);

    const setNodoInicial = useCallback(() => {
        setNodes([
        {
            id: '1',
            type: 'standard',
            position: { x: 250, y: 50 },
            data: {
            label: 'Inicio',
            onChange: onNodeLabelChange,
            customStyle: { borderRadius: '50px', background: '#8FBC8F', color: 'white' },
            },
        },
        ]);
        setEdges([]);
    }, [setNodes, setEdges, onNodeLabelChange]);

    useEffect(() => {
        setNodoInicial();
    }, [setNodoInicial]);

    // Si llega un item para editar (por ejemplo desde Administrator)
    useEffect(() => {
        if (mode !== 'edit' || !itemToEdit) return;

        setModoEdicion(true);
        setIdEditar(itemToEdit.id_db);
        setForm(itemToEdit.datos);
        setDirty(false);

        if (itemToEdit.datos?.estructura?.nodes) {
        const nodesWithFns = itemToEdit.datos.estructura.nodes.map((n) => ({
            ...n,
            data: { ...n.data, onChange: onNodeLabelChange, onMediaChange: onNodeMediaChange },
        }));
        setNodes(nodesWithFns);
        setEdges(itemToEdit.datos.estructura.edges || []);
        if (rfInstance) setTimeout(() => rfInstance.fitView({ duration: 800, padding: 0.2 }), 100);
        }
    }, [mode, itemToEdit, onNodeLabelChange, onNodeMediaChange, setNodes, setEdges, rfInstance]);

    useEffect(() => {
        if (mode === 'create') {
            limpiarFormulario();          // resetea todo (creación)
            return;
        }

        if (mode === 'edit' && itemToEdit) {
            // tu lógica de edición ya existe (la que carga form/nodes/edges)
            // se ejecuta con tu useEffect actual basado en itemToEdit
            return;
        }

        // fallback: si no hay item, crea
        if (!itemToEdit) limpiarFormulario();
        }, [mode, itemToEdit]);

    const onConnect = useCallback((params) => {
        const newEdge = {
        ...params,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#333',
        },
        style: { strokeWidth: 2, stroke: '#333' },
        type: 'smoothstep',
        };
        setEdges((eds) => addEdge(newEdge, eds));
        setDirty(true);
    }, [setEdges]);

    const doRegresar = () => {
        navigate('/administrator', { state: { usuario, tipo } });
        };

        const intentarSalir = () => {
        if (dirty) setShowLeaveModal(true);
        else doRegresar();
    };

    const agregarFigura = (tipoFigura) => {
        const id = `${nodes.length + 1}_${Date.now()}`;
        let newNode = {
        id,
        position: { x: Math.random() * 250 + 50, y: Math.random() * 250 + 50 },
        data: { label: '', onChange: onNodeLabelChange },
    };

    switch (tipoFigura) {
        case 'Inicio/Fin':
            newNode.type = 'standard';
            newNode.data.customStyle = { borderRadius: '50px', background: '#8FBC8F', color: 'white' };
            newNode.data.label = 'Inicio';
            break;
        case 'Proceso':
            newNode.type = 'standard';
            newNode.data.customStyle = { background: '#fff' };
            newNode.data.label = 'Proceso';
            break;
        case 'Entrada/Salida':
            newNode.type = 'io';
            newNode.data.label = 'Datos';
            break;
        case 'Decision':
            newNode.type = 'decision';
            newNode.data.label = '?';
            break;
        case 'Multimedia':
            newNode.type = 'multimedia';
            newNode.data.label = 'Media';
            newNode.data.mediaUrl = '';
            newNode.data.onMediaChange = onNodeMediaChange;
            break;
        default:
            break;
    }

    setNodes((nds) => nds.concat(newNode));
    setDirty(true);
  };

  const capturarDiagrama = () => {
  if (reactFlowWrapper.current === null) return;

  const controls = reactFlowWrapper.current.querySelector('.react-flow__controls');
  if (controls) controls.style.display = 'none';

  toPng(reactFlowWrapper.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 })
    .then(async (dataUrl) => {
      // PNG -> JPEG (más ligero)
      const compressed = await compressDataUrl(dataUrl, {
        mime: 'image/webp',
        quality: 0.6,
        maxWidth: 1200,
      });

      setForm((prev) => ({ ...prev, url: compressed, tipo: 'webp' }));
      showToast('Diagrama capturado', 'success');
    })
    .catch((err) => {
      console.log(err);
      showToast('No se pudo capturar el diagrama', 'danger');
    })
    .finally(() => {
      if (controls) controls.style.display = 'block';
    });
};

  const handleChange = (e) => {
    setDirty(true);
    setForm({ ...form, [e.target.name]: e.target.value });
    };

  const limpiarFormulario = () => {
    setForm({ titulo: '', descripcion: '', tipo: 'jpg', url: '' });
    setModoEdicion(false);
    setIdEditar(null);
    setNodoInicial();
    setDirty(false);
  };

  const handleNodesChange = useCallback((changes) => {
    setDirty(true);
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes) => {
    setDirty(true);
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quitamos funciones del data antes de guardar
    const nodesToSave = nodes.map((n) => {
      const { onChange, onMediaChange, ...dataWithoutFunc } = n.data;
      return { ...n, data: dataWithoutFunc };
    });

    const objetoJson = {
      ...form,
      autor: usuario,
      fecha: new Date().toLocaleDateString(),
      estructura: { nodes: nodesToSave, edges },
    };

    const metodo = modoEdicion ? 'PUT' : 'POST';
    const url = modoEdicion ? `${API_URL}?id=${idEditar}` : API_URL;

    try {
      await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objetoJson),
      });

        const texto = modoEdicion ? 'Diagrama actualizado' : 'Diagrama creado';

        if (typeof onSaved === 'function') onSaved();

        // navega al administrador y muestra toast allá
        navigate('/administrator', {
            replace: true,
            state: {
                usuario,
                tipo,
                alerta: { tipo: 'success', texto },
            },
        });
    } catch (error) {
      alert('Error al guardar');
    }
  };

  return (
    <div className="container mt-4">
      {mode !== 'edit' && (
        <h2 className="mb-4 text-primary">Crear diagrama</h2>
      )}

      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {toastInfo.show && (
            <div className={`toast align-items-center text-bg-${toastInfo.tipo} border-0 show`} role="alert" aria-live="polite" aria-atomic="true">
            <div className="d-flex">
                <div className="toast-body">{toastInfo.texto}</div>
                <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToastInfo((t) => ({ ...t, show: false }))}
                />
            </div>
            </div>
        )}
       </div>

      <div className="card p-4 mb-4 shadow-sm bg-light">
        <h5 className="mb-3">{modoEdicion ? '✏️ Editar Diagrama' : '➕ Nuevo Diagrama'}</h5>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <input
                type="text"
                name="titulo"
                className="form-control"
                placeholder="Título"
                value={form.titulo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
                <option value="jpg">Imagen (JPG/PNG)</option>
                <option value="mp4">Video (MP4)</option>
              </select>
            </div>
          </div>

          <textarea
            name="descripcion"
            className="form-control mb-3"
            rows="2"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            required
          />

          <div className="mb-3 border p-1 bg-white rounded">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom bg-light">
              <span className="fw-bold text-secondary">🎨 Herramientas:</span>

              <div className="btn-group">
                <button type="button" className="btn btn-sm btn-outline-success" onClick={() => agregarFigura('Inicio/Fin')}>
                  🟢 Inicio
                </button>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => agregarFigura('Proceso')}>
                  🟦 Proceso
                </button>
                <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => agregarFigura('Decision')}>
                  🔶 Decisión
                </button>
                <button type="button" className="btn btn-sm btn-outline-info" onClick={() => agregarFigura('Entrada/Salida')}>
                  ▱ E/S
                </button>
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => agregarFigura('Multimedia')}>
                  🎥 Media
                </button>
              </div>

              <button type="button" className="btn btn-sm btn-dark" onClick={capturarDiagrama}>
                📸 Capturar
              </button>
            </div>

            <div style={{ height: '400px', width: '100%', backgroundColor: '#f8f9fa' }} ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                onInit={setRfInstance}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </div>
          </div>

          <input
            type="text"
            name="url"
            className="form-control mb-3"
            value={form.url}
            onChange={handleChange}
            required
            readOnly={form.url?.startsWith('data:')}
          />

          <button type="submit" className="btn btn-primary w-100">
            {modoEdicion ? 'Actualizar Diagrama' : 'Guardar Diagrama'}
          </button>

          {modoEdicion && (
            <button type="button" className="btn btn-secondary w-100 mt-2" onClick={intentarSalir}>
              Cancelar Edición
            </button>
          )}
        </form>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button type="button" className="btn btn-sm btn-eliminar" onClick={intentarSalir}>
            ← Regresar
        </button>
      </div>
      {showLeaveModal && (
        <>
            <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Alerta</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowLeaveModal(false)} />
                </div>
                <div className="modal-body">
                    <p className="mb-0">¿Seguro que quiere salir sin guardar?</p>
                </div>
                <div className="modal-footer">
                    <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                        setShowLeaveModal(false);
                        doRegresar(); // "No guardar"
                    }}
                    >
                    No guardar
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>
                    Cancelar
                    </button>
                </div>
                </div>
            </div>
            </div>
            <div className="modal-backdrop show" />
        </>
      )}
    </div>
  );
};

export default function CanvasConProvider() {
  const location = useLocation();
  const { usuario, tipo, mode, itemToEdit } = location.state || {};

  return (
    <ReactFlowProvider>
      <Canvas usuario={usuario} tipo={tipo} mode={mode} itemToEdit={itemToEdit} />
    </ReactFlowProvider>
  );
}
