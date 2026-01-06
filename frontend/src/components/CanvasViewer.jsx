// src/componentes/CanvasViewer.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

// -----------------------------
// Helpers: YouTube parsing
// -----------------------------
const getYoutubeId = (url) => {
  if (!url) return null;

  try {
    const u = new URL(url);

    // youtu.be/VIDEO_ID
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id && id.length === 11 ? id : null;
    }

    // youtube.com/watch?v=VIDEO_ID
    const v = u.searchParams.get('v');
    if (v && v.length === 11) return v;

    // youtube.com/embed/VIDEO_ID, /shorts/VIDEO_ID, /live/VIDEO_ID, /v/VIDEO_ID
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p));
    if (idx !== -1 && parts[idx + 1] && parts[idx + 1].length === 11) return parts[idx + 1];

    return null;
  } catch (e) {
    // Not a valid URL -> fallback regex scan
    const m = String(url).match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }
};

const getYoutubeEmbedUrl = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

// --- NODOS SOLO LECTURA ---

const ReadOnlyLabel = ({ text }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      padding: '2px',
      boxSizing: 'border-box',
      textAlign: 'center',
      fontSize: '11px',
      fontFamily: 'sans-serif',
      lineHeight: '1.2',
      userSelect: 'text',
      whiteSpace: 'pre-wrap',
      overflow: 'hidden',
    }}
  >
    {text}
  </div>
);

// A. NODO ESTÁNDAR (solo lectura)
const StandardNodeView = ({ data, isConnectable }) => {
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
      <div style={{ width: '100%', height: '15px', background: 'rgba(0,0,0,0.06)' }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ReadOnlyLabel text={data.label || ''} />
      </div>

      <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

// B. NODO DECISIÓN (solo lectura)
const DecisionNodeView = ({ data, isConnectable }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
        <ReadOnlyLabel text={data.label || ''} />
      </div>

      <Handle type="target" position={Position.Top} style={{ top: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="r" style={{ right: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ bottom: 15, background: '#555' }} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} id="l" style={{ left: 15, background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

// C. NODO E/S (solo lectura)
const InputOutputNodeView = ({ data, isConnectable }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '140px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
        <div style={{ width: '100%', height: '15px', borderBottom: '1px solid rgba(0,0,0,0.08)' }} />
        <div style={{ flex: 1 }}>
          <ReadOnlyLabel text={data.label || ''} />
        </div>
      </div>

      <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

// D. NODO MULTIMEDIA (solo lectura)
const MultimediaNodeView = ({ data, isConnectable }) => {
  const url = data.mediaUrl || '';
  const youtubeEmbed = getYoutubeEmbedUrl(url);
  const esYoutube = !!youtubeEmbed;

  const esImagen = url && url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  const esVideo = url && url.match(/\.(mp4|webm)$/i) != null;
  const esAudio = url && url.match(/\.(mp3|wav)$/i) != null;

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: 'white', fontSize: '10px' }}>Multimedia</span>
      </div>

      {/* IMPORTANT:
          - nodrag + nopan so ReactFlow doesn't steal clicks
          - pointerEvents:auto so video/iframe controls work
      */}
      <div
        className="nodrag nopan"
        style={{
          flex: 1,
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        {url && (
          <div style={{ fontSize: 9, wordBreak: 'break-all', textAlign: 'center', color: '#333' }}>
            {url}
          </div>
        )}

        {esYoutube && (
          <div className="nodrag nopan" style={{ width: '100%', pointerEvents: 'auto' }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
              <iframe
                title="YouTube"
                src={youtubeEmbed}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                  borderRadius: 6,
                  pointerEvents: 'auto',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {!esYoutube && esImagen && (
          <img src={url} alt="media" style={{ maxWidth: '100%', maxHeight: 110, borderRadius: 6, pointerEvents: 'auto' }} />
        )}

        {!esYoutube && esVideo && (
          <video src={url} controls style={{ maxWidth: '100%', maxHeight: 110, pointerEvents: 'auto' }} />
        )}

        {!esYoutube && esAudio && (
          <audio src={url} controls style={{ width: '100%', pointerEvents: 'auto' }} />
        )}

        <div style={{ width: '100%' }}>
          <ReadOnlyLabel text={data.label || ''} />
        </div>
      </div>

      <Handle type="target" position={Position.Top} style={{ background: '#555' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} isConnectable={isConnectable} />
    </div>
  );
};

const nodeTypesView = {
  standard: StandardNodeView,
  decision: DecisionNodeView,
  io: InputOutputNodeView,
  multimedia: MultimediaNodeView,
};

function CanvasViewerInner() {
  const location = useLocation();
  const navigate = useNavigate();

  const { usuario, tipo, itemToView } = location.state || {};
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const titulo = itemToView?.datos?.titulo || 'Vista del diagrama';
  const descripcion = itemToView?.datos?.descripcion || '';

  useEffect(() => {
    const estructura = itemToView?.datos?.estructura;

    if (estructura?.nodes && estructura?.edges) {
      setNodes(estructura.nodes);
      setEdges(estructura.edges);
      return;
    }

    // Fallback: si no hay estructura, mostramos nodo simple
    const url = itemToView?.datos?.url;
    if (url) {
      setNodes([
        {
          id: 'fallback',
          type: 'standard',
          position: { x: 50, y: 50 },
          data: {
            label: 'Vista previa disponible',
            customStyle: { background: '#fff' },
          },
        },
      ]);
      setEdges([]);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [itemToView]);

  const regresar = () => {
    navigate('/administrator', { state: { usuario, tipo } });
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button type="button" className="btn btn-secondary" onClick={regresar}>
          ← Regresar
        </button>

        <div className="text-end">
          <div className="fw-bold">Título: {titulo}</div>
          {usuario && (
            <div className="text-muted" style={{ fontSize: 12 }}>
              Autor: {usuario}
            </div>
          )}
        </div>
      </div>

      <div className="card p-2 shadow-sm bg-light">
        <div style={{ height: '520px', width: '100%', backgroundColor: '#f8f9fa' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypesView}
            fitView
            // 🔒 Bloqueo de edición:
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            // ✅ Navegación:
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>

      {descripcion && (
        <div className="mt-3">
          <div className="text-muted" style={{ fontSize: 13 }}>
            <strong>Descripción:</strong> {descripcion}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CanvasViewer() {
  return (
    <ReactFlowProvider>
      <CanvasViewerInner />
    </ReactFlowProvider>
  );
}
