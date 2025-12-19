import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

// API Backend
const api = axios.create({
  baseURL: 'http://localhost:8888',
  timeout: 10000
});

export default function App() {
  // Estado global
  const [view, setView] = useState("home");
  const [clienteId, setClienteId] = useState(1); // Por ahora hardcodeado
  const [ubicacionActual, setUbicacionActual] = useState("Localizando...");
  const [coordenadas, setCoordenadas] = useState({ lat: null, lon: null });

  // Estados Lugares
  const [lugares, setLugares] = useState([]);
  const [nuevoLugar, setNuevoLugar] = useState({ nombre: '', direccion: '', categoria: 'Casa' });

  // Estados Contactos
  const [contactos, setContactos] = useState([]);
  const [nuevoContacto, setNuevoContacto] = useState({ nombre: '', telefono: '', relacion: 'Familia' });

  // Función hablar
  const hablar = (texto) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  // Reconocimiento de voz
  const [escuchando, setEscuchando] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'es-ES';
      rec.continuous = false;
      rec.onresult = (event) => {
        const comando = event.results[0][0].transcript.toLowerCase();
        console.log('Comando:', comando);
        procesarComandoVoz(comando);
      };
      rec.onend = () => setEscuchando(false);
      setRecognition(rec);
    }
  }, [view, lugares, contactos]);

  const iniciarVoz = () => {
    if (recognition) {
      setEscuchando(true);
      recognition.start();
    }
  };

  const procesarComandoVoz = (comando) => {
    // HOME
    if (view === 'home') {
      if (comando.includes('lugar') || comando.includes('rutas')) {
        setView('lugares');
        hablar('Abriendo lugares favoritos');
      } else if (comando.includes('contacto') || comando.includes('emergencia')) {
        setView('contactos');
        hablar('Abriendo contactos de emergencia');
      } else if (comando.includes('ubicación') || comando.includes('donde estoy') || comando.includes('donde') || comando.includes('ubicacion')) {
        setView('ubicacion');
        hablar('Abriendo ubicación actual');
      }
    }
    // UBICACIÓN
    else if (view === 'ubicacion') {
      if (comando.includes('volver') || comando.includes('inicio')) {
        setView('home');
        hablar('Volviendo al inicio');
      } else if (comando.includes('donde estoy') || comando.includes('ubicacion')) {
        hablar(`Estás en ${ubicacionActual}`);
      } else if (comando.includes('compartir')) {
        compartirUbicacion();
      }
    }
    // LUGARES
    else if (view === 'lugares') {
      if (comando.includes('volver') || comando.includes('inicio')) {
        setView('home');
        hablar('Volviendo al inicio');
      } else if (comando.includes('guardar')) {
        crearLugar();
      } else {
        // Buscar lugar por nombre
        const lugarEncontrado = lugares.find(l =>
          comando.includes(l.nombreLugar.toLowerCase())
        );
        if (lugarEncontrado) {
          navegarALugar(lugarEncontrado);
        }
      }
    }
    // CONTACTOS
    else if (view === 'contactos') {
      if (comando.includes('volver') || comando.includes('inicio')) {
        setView('home');
        hablar('Volviendo al inicio');
      } else if (comando.includes('guardar')) {
        crearContacto();
      } else if (comando.includes('llama') || comando.includes('llamar')) {
        // Buscar contacto por nombre o relación
        const contactoEncontrado = contactos.find(c =>
          comando.includes(c.nombreContacto.toLowerCase()) ||
          comando.includes(c.relacionContacto.toLowerCase())
        );
        if (contactoEncontrado) {
          llamarContacto(contactoEncontrado);
        } else if (contactos.length > 0) {
          // Llamar al primero
          llamarContacto(contactos[0]);
        }
      } else if (comando.includes('muestra') || comando.includes('cuales')) {
        if (contactos.length > 0) {
          const nombres = contactos.map(c => c.nombreContacto).join(', ');
          hablar(`Tienes ${contactos.length} contactos: ${nombres}`);
        } else {
          hablar('No tienes contactos guardados');
        }
      }
    }
  };

  // Obtener ubicación GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordenadas({ lat: latitude, lon: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setUbicacionActual(data.display_name.split(',').slice(0, 2).join(', '));
        } catch (e) {
          setUbicacionActual(`GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        }
      });
    }
  }, []);

  // Función compartir ubicación
  const compartirUbicacion = () => {
    if (coordenadas.lat && coordenadas.lon) {
      const mensaje = `Mi ubicación: ${ubicacionActual}\nCoordenadas: ${coordenadas.lat.toFixed(5)}, ${coordenadas.lon.toFixed(5)}\nMapa: https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lon}`;
      if (navigator.share) {
        navigator.share({ title: 'Mi ubicación', text: mensaje });
        hablar('Compartiendo ubicación');
      } else {
        navigator.clipboard.writeText(mensaje);
        hablar('Ubicación copiada al portapapeles');
      }
    }
  };

  // ==================== LUGARES - CRUD ====================
  useEffect(() => {
    if (view === 'lugares') cargarLugares();
  }, [view]);

  const cargarLugares = async () => {
    try {
      const response = await api.get('/lugares-turisticos/lista');
      setLugares(Array.isArray(response.data) ? response.data : []);
      hablar(`Tienes ${response.data.length} lugares guardados`);
    } catch (error) {
      console.error('Error cargar lugares:', error);
      setLugares([]);
    }
  };

  const crearLugar = async () => {
    if (!nuevoLugar.nombre || !nuevoLugar.direccion) {
      hablar('Completa nombre y dirección');
      return;
    }

    try {
      await api.post('/lugares-turisticos/crear', {
        nombreLugar: nuevoLugar.nombre,
        direccionLugar: nuevoLugar.direccion,
        categoriaLugar: nuevoLugar.categoria,
        clienteIdCliente: clienteId,
        estadoLugar: 'activo',
        latitudLugar: '0',
        longitudLugar: '0'
      });
      hablar('Lugar guardado');
      setNuevoLugar({ nombre: '', direccion: '', categoria: 'Casa' });
      cargarLugares();
    } catch (error) {
      console.error('Error crear lugar:', error);
      hablar('Error al guardar');
    }
  };

  const eliminarLugar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar ${nombre}?`)) return;
    try {
      await api.delete(`/lugares-turisticos/eliminar/${id}`);
      hablar('Lugar eliminado');
      cargarLugares();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const navegarALugar = (lugar) => {
    hablar(`Abriendo navegación hacia ${lugar.nombreLugar}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lugar.direccionLugar)}&travelmode=walking`, '_blank');
  };

  // ==================== CONTACTOS - CRUD ====================
  useEffect(() => {
    if (view === 'contactos') cargarContactos();
  }, [view]);

  const cargarContactos = async () => {
    try {
      const response = await api.get(`/contactos-emergencia/cliente/${clienteId}`);
      setContactos(Array.isArray(response.data) ? response.data : []);
      hablar(`Tienes ${response.data.length} contactos de emergencia`);
    } catch (error) {
      console.error('Error cargar contactos:', error);
      setContactos([]);
    }
  };

  const crearContacto = async () => {
    if (!nuevoContacto.nombre || !nuevoContacto.telefono) {
      hablar('Completa nombre y teléfono');
      return;
    }

    try {
      await api.post('/contactos-emergencia/', {
        nombreContacto: nuevoContacto.nombre,
        telefonoContacto: nuevoContacto.telefono,
        relacionContacto: nuevoContacto.relacion,
        prioridadContacto: contactos.length + 1,
        clienteIdCliente: clienteId,
        estadoContacto: 'activo',
        fotoContacto: ''
      });
      hablar('Contacto guardado');
      setNuevoContacto({ nombre: '', telefono: '', relacion: 'Familia' });
      cargarContactos();
    } catch (error) {
      console.error('Error crear contacto:', error);
      hablar('Error al guardar');
    }
  };

  const eliminarContacto = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar ${nombre}?`)) return;
    try {
      await api.delete(`/contactos-emergencia/${id}`);
      hablar('Contacto eliminado');
      cargarContactos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const llamarContacto = (contacto) => {
    hablar(`Llamando a ${contacto.nombreContacto}`);
    setTimeout(() => {
      window.location.href = `tel:${contacto.telefonoContacto}`;
    }, 1500);
  };

  // ==================== VISTAS ====================
  return (
    <div className="mobile-container">

      {/* ==================== HOME ==================== */}
      {view === "home" && (
        <div className="view-full">
          <header className="main-header">
            <span className="material-icons-round" style={{color:'var(--primary)'}}>visibility</span>
            <h1 className="title-brand">OpenBlind</h1>
          </header>

          <div className="hero-location">
            <small style={{opacity:0.8}}>ESTÁS EN:</small>
            <p style={{margin:0, fontWeight:'bold', fontSize:'1rem'}}>{ubicacionActual}</p>
          </div>

          <div className="menu-list">
            <div className="card-module" onClick={() => { setView('ubicacion'); hablar("Abriendo Ubicación"); }}>
              <div className="info">
                <h3>📍 Ubicación Actual</h3>
                <p>Ver dónde estás ahora</p>
              </div>
              <span className="material-icons-round" style={{color:'var(--primary)', fontSize:'30px'}}>my_location</span>
            </div>

            <div className="card-module" onClick={() => { setView('lugares'); hablar("Abriendo Lugares"); }}>
              <div className="info">
                <h3>🏠 Lugares Favoritos</h3>
                <p>Ver y guardar sitios importantes</p>
              </div>
              <span className="material-icons-round" style={{color:'var(--primary)', fontSize:'30px'}}>place</span>
            </div>

            <div className="card-module" onClick={() => { setView('contactos'); hablar("Abriendo Contactos"); }}>
              <div className="info">
                <h3>📞 Contactos Emergencia</h3>
                <p>Llamadas rápidas y ayuda</p>
              </div>
              <span className="material-icons-round" style={{color:'var(--accent)', fontSize:'30px'}}>contacts</span>
            </div>
          </div>

          <div className="action-area">
            <button className="btn-main" onClick={iniciarVoz} style={{background: escuchando ? 'var(--accent)' : 'var(--primary)'}}>
              <span className="material-icons-round">{escuchando ? 'mic' : 'mic_none'}</span>
              {escuchando ? 'ESCUCHANDO...' : 'COMANDO DE VOZ'}
            </button>
          </div>
        </div>
      )}

      {/* ==================== UBICACIÓN ==================== */}
      {view === "ubicacion" && (
        <div className="view-full" style={{paddingTop:'45px'}}>
          <div style={{padding:'0 20px'}}>
            <button className="btn-icon-back" onClick={() => setView('home')} style={{background:'none', border:'none', color:'var(--primary)', fontWeight:'bold', marginBottom:'10px'}}>
              <span className="material-icons-round">arrow_back</span> VOLVER
            </button>

            <h2 style={{fontSize:'1.5rem', marginBottom:'15px'}}>📍 Mi Ubicación</h2>

            {/* INFORMACIÓN GPS */}
            <div style={{background:'white', padding:'20px', borderRadius:'20px', marginBottom:'15px'}}>
              <div style={{marginBottom:'15px'}}>
                <h4 style={{margin:'0 0 8px 0', fontSize:'0.9rem', opacity:0.6}}>DIRECCIÓN:</h4>
                <p style={{margin:0, fontSize:'1.1rem', fontWeight:'bold'}}>{ubicacionActual}</p>
              </div>

              {coordenadas.lat && coordenadas.lon && (
                <div>
                  <h4 style={{margin:'15px 0 8px 0', fontSize:'0.9rem', opacity:0.6}}>COORDENADAS GPS:</h4>
                  <p style={{margin:0, fontSize:'1rem', fontFamily:'monospace'}}>
                    📍 {coordenadas.lat.toFixed(5)}, {coordenadas.lon.toFixed(5)}
                  </p>
                </div>
              )}
            </div>

            {/* MAPA */}
            {coordenadas.lat && coordenadas.lon && (
              <div className="map-frame">
                <iframe
                  title="Mapa de ubicación"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{border:0}}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordenadas.lon-0.01},${coordenadas.lat-0.01},${coordenadas.lon+0.01},${coordenadas.lat+0.01}&layer=mapnik&marker=${coordenadas.lat},${coordenadas.lon}`}
                  allowFullScreen
                />
              </div>
            )}

            {/* ACCIONES */}
            <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
              <button
                className="btn-nav"
                onClick={compartirUbicacion}
                style={{background:'var(--primary)', color:'white', flex:1}}
              >
                <span className="material-icons-round">share</span> COMPARTIR
              </button>
              {coordenadas.lat && coordenadas.lon && (
                <button
                  onClick={() => {
                    hablar('Abriendo en Google Maps');
                    window.open(`https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lon}`, '_blank');
                  }}
                  style={{background:'var(--accent)', color:'white', flex:1, padding:'12px', borderRadius:'15px', border:'none', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
                >
                  <span className="material-icons-round">map</span> VER EN MAPA
                </button>
              )}
            </div>
          </div>

          <div className="action-area">
            <button className="btn-main" onClick={iniciarVoz} style={{background: escuchando ? 'var(--accent)' : 'var(--primary)'}}>
              <span className="material-icons-round">{escuchando ? 'mic' : 'volume_up'}</span>
              {escuchando ? 'ESCUCHANDO...' : 'COMANDO DE VOZ'}
            </button>
          </div>
        </div>
      )}

      {/* ==================== LUGARES ==================== */}
      {view === "lugares" && (
        <div className="view-full" style={{paddingTop:'45px'}}>
          <div style={{padding:'0 20px'}}>
            <button className="btn-icon-back" onClick={() => setView('home')} style={{background:'none', border:'none', color:'var(--primary)', fontWeight:'bold', marginBottom:'10px'}}>
              <span className="material-icons-round">arrow_back</span> VOLVER
            </button>

            <h2 style={{fontSize:'1.5rem', marginBottom:'15px'}}>🏠 Mis Lugares</h2>

            {/* FORMULARIO NUEVO */}
            <div style={{background:'white', padding:'15px', borderRadius:'20px', marginBottom:'15px'}}>
              <input
                type="text"
                placeholder="Nombre del lugar *"
                className="map-input"
                value={nuevoLugar.nombre}
                onChange={(e) => setNuevoLugar({...nuevoLugar, nombre: e.target.value})}
              />
              <input
                type="text"
                placeholder="Dirección *"
                className="map-input"
                value={nuevoLugar.direccion}
                onChange={(e) => setNuevoLugar({...nuevoLugar, direccion: e.target.value})}
              />
              <select
                className="map-input"
                value={nuevoLugar.categoria}
                onChange={(e) => setNuevoLugar({...nuevoLugar, categoria: e.target.value})}
              >
                <option value="Casa">🏠 Casa</option>
                <option value="Trabajo">💼 Trabajo</option>
                <option value="Hospital">🏥 Hospital</option>
                <option value="Tienda">🛒 Tienda</option>
                <option value="Parque">🌳 Parque</option>
              </select>
              <button className="btn-main" onClick={crearLugar} style={{background:'var(--primary)'}}>
                GUARDAR LUGAR
              </button>
            </div>
          </div>

          {/* LISTA */}
          <div className="saved-list">
            <h4>LUGARES GUARDADOS ({lugares.length})</h4>
            {lugares.map(l => (
              <div key={l.idLugar} className="mini-card">
                <div>
                  <b>{l.nombreLugar}</b>
                  <p style={{fontSize:'0.9rem', opacity:0.7}}>{l.direccionLugar}</p>
                  <span style={{background:'var(--primary)', color:'white', padding:'3px 8px', borderRadius:'10px', fontSize:'0.8rem'}}>
                    {l.categoriaLugar}
                  </span>
                </div>
                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                  <button className="btn-nav" onClick={() => navegarALugar(l)} style={{flex:1, background:'var(--primary)', color:'white'}}>
                    <span className="material-icons-round">directions</span> IR
                  </button>
                  <button onClick={() => eliminarLugar(l.idLugar, l.nombreLugar)} style={{background:'#DC2626', color:'white', padding:'10px', borderRadius:'10px', border:'none', fontWeight:'bold'}}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="action-area">
            <button className="btn-main" onClick={iniciarVoz} style={{background: escuchando ? 'var(--accent)' : 'var(--primary)'}}>
              <span className="material-icons-round">{escuchando ? 'mic' : 'volume_up'}</span>
              {escuchando ? 'ESCUCHANDO...' : 'COMANDO DE VOZ'}
            </button>
          </div>
        </div>
      )}

      {/* ==================== CONTACTOS ==================== */}
      {view === "contactos" && (
        <div className="view-full" style={{paddingTop:'45px'}}>
          <div style={{padding:'0 20px'}}>
            <button className="btn-icon-back" onClick={() => setView('home')} style={{background:'none', border:'none', color:'var(--primary)', fontWeight:'bold', marginBottom:'10px'}}>
              <span className="material-icons-round">arrow_back</span> VOLVER
            </button>

            <h2 style={{fontSize:'1.5rem', marginBottom:'15px'}}>📞 Contactos</h2>

            {/* FORMULARIO NUEVO */}
            <div style={{background:'white', padding:'15px', borderRadius:'20px', marginBottom:'15px'}}>
              <input
                type="text"
                placeholder="Nombre *"
                className="map-input"
                value={nuevoContacto.nombre}
                onChange={(e) => setNuevoContacto({...nuevoContacto, nombre: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Teléfono *"
                className="map-input"
                value={nuevoContacto.telefono}
                onChange={(e) => setNuevoContacto({...nuevoContacto, telefono: e.target.value})}
              />
              <select
                className="map-input"
                value={nuevoContacto.relacion}
                onChange={(e) => setNuevoContacto({...nuevoContacto, relacion: e.target.value})}
              >
                <option value="Familia">👨‍👩‍👦 Familia</option>
                <option value="Mamá">👩 Mamá</option>
                <option value="Papá">👨 Papá</option>
                <option value="Médico">⚕️ Médico</option>
                <option value="Amigo">👥 Amigo</option>
              </select>
              <button className="btn-main" onClick={crearContacto} style={{background:'var(--primary)'}}>
                GUARDAR CONTACTO
              </button>
            </div>
          </div>

          {/* LISTA */}
          <div className="saved-list">
            <h4>CONTACTOS GUARDADOS ({contactos.length})</h4>
            {contactos.map(c => (
              <div key={c.idContactoEmergencia} className="mini-card">
                <div>
                  <b>{c.nombreContacto}</b>
                  <p style={{fontSize:'0.9rem', opacity:0.7}}>📞 {c.telefonoContacto}</p>
                  <span style={{background:'var(--accent)', color:'white', padding:'3px 8px', borderRadius:'10px', fontSize:'0.8rem'}}>
                    {c.relacionContacto}
                  </span>
                </div>
                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                  <button onClick={() => llamarContacto(c)} style={{flex:1, background:'var(--primary)', color:'white', padding:'12px', borderRadius:'10px', border:'none', fontWeight:'bold'}}>
                    <span className="material-icons-round">call</span> LLAMAR
                  </button>
                  <button onClick={() => eliminarContacto(c.idContactoEmergencia, c.nombreContacto)} style={{background:'#DC2626', color:'white', padding:'10px', borderRadius:'10px', border:'none', fontWeight:'bold'}}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="action-area">
            <button className="btn-main" onClick={iniciarVoz} style={{background: escuchando ? 'var(--accent)' : 'var(--primary)'}}>
              <span className="material-icons-round">{escuchando ? 'mic' : 'volume_up'}</span>
              {escuchando ? 'ESCUCHANDO...' : 'COMANDO DE VOZ'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
