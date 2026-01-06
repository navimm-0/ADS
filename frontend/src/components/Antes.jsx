import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  addEdge, Background, Controls, MiniMap, 
  useNodesState, useEdgesState, Handle, Position,
  useReactFlow, ReactFlowProvider,
  MarkerType // <--- 1. IMPORTANTE: Importamos el tipo de marcador para la flecha
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

const API_URL = 'http://localhost:8080/crud';

// --- ESTILOS ---
const textAreaStyle = {
    width: '100%', height: '100%', border: 'none', background: 'transparent',
    resize: 'none', textAlign: 'center', fontSize: '11px', fontFamily: 'sans-serif',
    outline: 'none', padding: '2px', boxSizing: 'border-box', 
    lineHeight: '1.2', pointerEvents: 'all' 
};

// --- 1. DEFINICIÓN DE NODOS PERSONALIZADOS ---

// A. NODO ESTÁNDAR
const StandardNode = ({ id, data, isConnectable }) => {
    return (
      <div style={{ ...data.customStyle, width: '120px', height: '60px', position: 'relative', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '15px', background: 'rgba(0,0,0,0.1)', cursor: 'grab' }}></div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <textarea className="nodrag" value={data.label} onChange={(evt) => data.onChange(id, evt.target.value)} style={textAreaStyle} />
        </div>
        <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
      </div>
    );
};

// B. NODO DECISIÓN
const DecisionNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: '70px', height: '70px', background: '#fff', border: '2px solid #555', transform: 'rotate(45deg)', zIndex: -1, borderRadius: '4px' }} />
      <div style={{ width: '50px', height: '50px', zIndex: 1 }}>
        <textarea className="nodrag" value={data.label} onChange={(evt) => data.onChange(id, evt.target.value)} style={textAreaStyle} />
      </div>
      <Handle type="target" position={Position.Top} style={{ top: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="r" style={{ right: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ bottom: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} id="l" style={{ left: 15, background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

// C. NODO E/S
const InputOutputNode = ({ id, data, isConnectable }) => {
    return (
      <div style={{ position: 'relative', width: '140px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '120px', height: '100%', background: '#ADD8E6', border: '1px solid #333', transform: 'skew(-20deg)', zIndex: -1, borderRadius: '4px' }} />
        <div style={{ width: '110px', height: '100%', display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={{ width: '100%', height: '15px', cursor: 'grab', borderBottom: '1px solid rgba(0,0,0,0.1)' }}></div>
            <div style={{ flex: 1 }}>
                <textarea className="nodrag" value={data.label} onChange={(evt) => data.onChange(id, evt.target.value)} style={textAreaStyle} />
            </div>
        </div>
        <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
      </div>
    );
};

// D. NODO MULTIMEDIA
const MultimediaNode = ({ id, data, isConnectable }) => {
    const esImagen = data.mediaUrl && (data.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) != null);
    const esVideo = data.mediaUrl && (data.mediaUrl.match(/\.(mp4|webm)$/) != null);
    const esAudio = data.mediaUrl && (data.mediaUrl.match(/\.(mp3|wav)$/) != null);

    return (
        <div style={{ 
            width: '160px', minHeight: '100px', background: '#fff', border: '2px dashed #007bff', borderRadius: '8px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            <div style={{ width: '100%', height: '20px', background: '#007bff', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '10px' }}>Multimedia</span>
            </div>
            <div style={{ flex: 1, padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <input className="nodrag form-control form-control-sm mb-2" placeholder="Pega URL (img/mp3/mp4)" value={data.mediaUrl} onChange={(evt) => data.onMediaChange(id, evt.target.value)} style={{ fontSize: '9px', padding: '2px' }} />
                { esImagen && <img src={data.mediaUrl} alt="media" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px' }} /> }
                { esVideo && <video src={data.mediaUrl} controls style={{ maxWidth: '100%', maxHeight: '100px' }} /> }
                { esAudio && <audio src={data.mediaUrl} controls style={{ width: '100%', height: '30px' }} /> }
                <textarea className="nodrag" value={data.label} onChange={(evt) => data.onChange(id, evt.target.value)} style={{...textAreaStyle, height: '20px', marginTop: '5px', fontSize: '10px'}} placeholder="Etiqueta..." />
            </div>
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
        </div>
    );
};

const nodeTypes = { standard: StandardNode, decision: DecisionNode, io: InputOutputNode, multimedia: MultimediaNode };

const CrudDiagramas = ({ usuario }) => {
  const [lista, setLista] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', tipo: 'jpg', url: '' });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);
  const { setNodes: setNodesReactFlow } = useReactFlow(); 

  const onNodeLabelChange = useCallback((nodeId, newLabel) => {
    setNodesReactFlow((nds) => nds.map((node) => {
        if (node.id === nodeId) node.data = { ...node.data, label: newLabel };
        return node;
    }));
  }, [setNodesReactFlow]);

  const onNodeMediaChange = useCallback((nodeId, newUrl) => {
    setNodesReactFlow((nds) => nds.map((node) => {
        if (node.id === nodeId) node.data = { ...node.data, mediaUrl: newUrl };
        return node;
    }));
  }, [setNodesReactFlow]);

  useEffect(() => {
    setNodes([{ id: '1', type: 'standard', position: { x: 250, y: 50 }, data: { label: 'Inicio', onChange: onNodeLabelChange, customStyle: { borderRadius: '50px', background: '#8FBC8F', color: 'white' } } }]);
  }, [onNodeLabelChange, setNodes]); 

  // --- 2. MODIFICACIÓN AQUÍ: LÓGICA DE CONEXIÓN PARA FLECHAS ---
  const onConnect = useCallback((params) => {
    // Creamos la nueva conexión añadiéndole el marcador de final (flecha)
    const newEdge = {
        ...params,
        markerEnd: {
            type: MarkerType.ArrowClosed, // Tipo de flecha cerrada
            width: 20, // Ancho de la punta
            height: 20, // Alto de la punta
            color: '#333', // Color de la flecha
        },
        style: { strokeWidth: 2, stroke: '#333' }, // Estilo de la línea
        type: 'smoothstep' // (Opcional) Hace que las líneas sean rectas con esquinas redondeadas, más tipo diagrama
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);
  // ---------------------------------------------------------

  const agregarFigura = (tipoFigura) => {
    const id = `${nodes.length + 1}_${Date.now()}`;
    let newNode = { id, position: { x: Math.random() * 250 + 50, y: Math.random() * 250 + 50 }, data: { label: '', onChange: onNodeLabelChange } };

    switch (tipoFigura) {
        case 'Inicio/Fin': newNode.type = 'standard'; newNode.data.customStyle = { borderRadius: '50px', background: '#8FBC8F', color: 'white' }; newNode.data.label = 'Inicio'; break;
        case 'Proceso': newNode.type = 'standard'; newNode.data.customStyle = { background: '#fff' }; newNode.data.label = 'Proceso'; break;
        case 'Entrada/Salida': newNode.type = 'io'; newNode.data.label = 'Datos'; break;
        case 'Decision': newNode.type = 'decision'; newNode.data.label = '?'; break;
        case 'Multimedia': newNode.type = 'multimedia'; newNode.data.label = 'Media'; newNode.data.mediaUrl = ''; newNode.data.onMediaChange = onNodeMediaChange; break;
        default: break;
    }
    setNodes((nds) => nds.concat(newNode));
  };

  const capturarDiagrama = () => {
    if (reactFlowWrapper.current === null) return;
    const controls = reactFlowWrapper.current.querySelector('.react-flow__controls');
    if(controls) controls.style.display = 'none';
    toPng(reactFlowWrapper.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 })
      .then((dataUrl) => { setForm({ ...form, url: dataUrl, tipo: 'png' }); alert("Diagrama capturado."); })
      .catch((err) => { console.log(err); alert("Error al capturar"); })
      .finally(() => { if(controls) controls.style.display = 'block'; });
  };

  const cargarDatos = async () => {
    try {
      const resp = await fetch(API_URL);
      const data = await resp.json();
      setLista(data);
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { cargarDatos(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nodesToSave = nodes.map(n => {
        const { onChange, onMediaChange, ...dataWithoutFunc } = n.data;
        return { ...n, data: dataWithoutFunc };
    });
    const objetoJson = { ...form, autor: usuario, fecha: new Date().toLocaleDateString(), estructura: { nodes: nodesToSave, edges: edges } };
    const metodo = modoEdicion ? 'PUT' : 'POST'; 
    const url = modoEdicion ? `${API_URL}?id=${idEditar}` : API_URL;
    try {
        await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(objetoJson) });
        alert(modoEdicion ? "Diagrama Actualizado" : "Diagrama Creado");
        limpiarFormulario(); cargarDatos();
    } catch (error) { alert("Error al guardar"); }
  };

  const limpiarFormulario = () => {
      setForm({ titulo: '', descripcion: '', tipo: 'jpg', url: '' });
      setModoEdicion(false); setIdEditar(null);
       setNodes([{ id: '1', type: 'standard', position: { x: 250, y: 50 }, data: { label: 'Inicio', onChange: onNodeLabelChange, customStyle: { borderRadius: '50px', background: '#8FBC8F', color: 'white' } } }]);
       setEdges([]);
  };

  const editar = (item) => {
    setModoEdicion(true); setIdEditar(item.id_db); setForm(item.datos); 
    if (item.datos.estructura && item.datos.estructura.nodes) {
        const nodesWithFunction = item.datos.estructura.nodes.map(n => ({
            ...n, data: { ...n.data, onChange: onNodeLabelChange, onMediaChange: onNodeMediaChange }
        }));
        setNodes(nodesWithFunction);
        setEdges(item.datos.estructura.edges || []);
        if (rfInstance) { setTimeout(() => { rfInstance.fitView({ duration: 800, padding: 0.2 }); }, 100); }
    } else {
        limpiarFormulario(); 
        if (rfInstance) { setTimeout(() => rfInstance.fitView(), 100); }
    }
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar?")) return;
    try { await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' }); cargarDatos(); } catch (e) {}
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">Gestión de Diagramas</h2>
      <div className="card p-4 mb-5 shadow-sm bg-light">
        <h5 className="mb-3">{modoEdicion ? '✏️ Editar Diagrama' : '➕ Nuevo Diagrama'}</h5>
        <form onSubmit={handleSubmit}>
          <div className="row">
              <div className="col-md-6 mb-3">
                <input type="text" name="titulo" className="form-control" placeholder="Título" value={form.titulo} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
                    <option value="jpg">Imagen (JPG/PNG)</option>
                    <option value="mp4">Video (MP4)</option>
                </select>
              </div>
          </div>
          <textarea name="descripcion" className="form-control mb-3" rows="2" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />

          <div className="mb-3 border p-1 bg-white rounded">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom bg-light">
                <span className="fw-bold text-secondary">🎨 Herramientas:</span>
                <div className="btn-group">
                    <button type="button" className="btn btn-sm btn-outline-success" onClick={() => agregarFigura('Inicio/Fin')}>🟢 Inicio</button>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => agregarFigura('Proceso')}>🟦 Proceso</button>
                    <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => agregarFigura('Decision')}>🔶 Decisión</button>
                    <button type="button" className="btn btn-sm btn-outline-info" onClick={() => agregarFigura('Entrada/Salida')}>▱ E/S</button>
                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => agregarFigura('Multimedia')}>🎥 Media</button>
                </div>
                <button type="button" className="btn btn-sm btn-dark" onClick={capturarDiagrama}>📸 Capturar</button>
            </div>
            
            <div style={{ height: '400px', width: '100%', backgroundColor: '#f8f9fa' }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes} edges={edges}
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                    onConnect={onConnect} onInit={setRfInstance}
                    nodeTypes={nodeTypes} fitView
                >
                    <Controls /> <MiniMap />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </div>
          </div>
          <input type="text" name="url" className="form-control mb-3" value={form.url} onChange={handleChange} required readOnly={form.url.startsWith('data:')} />
          <button type="submit" className="btn btn-primary w-100">{modoEdicion ? 'Actualizar Diagrama' : 'Guardar Diagrama'}</button>
          {modoEdicion && <button type="button" className="btn btn-secondary w-100 mt-2" onClick={limpiarFormulario}>Cancelar Edición</button>}
        </form>
      </div>
      <h4 className="mb-3">Diagramas Guardados</h4>
      <div className="row">
        {lista.map((item) => (
            <div className="col-md-4 mb-4" key={item.id_db}>
                <div className="card h-100 shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title">{item.datos.titulo}</h5>
                        { item.datos.url && <img src={item.datos.url} className="img-fluid mb-2 rounded border" /> }
                    </div>
                    <div className="card-footer d-flex justify-content-end gap-2">
                         <button className="btn btn-warning btn-sm" onClick={() => editar(item)}>Editar</button>
                         <button className="btn btn-danger btn-sm" onClick={() => eliminar(item.id_db)}>Eliminar</button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default function CrudDiagramasConProvider(props) {
  return (
    <ReactFlowProvider>
      <CrudDiagramas {...props} />
    </ReactFlowProvider>
  );
}