import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import lugaresService from './services/lugaresService';
import contactosService from './services/contactosService';
import { useVoiceCommands, hablar } from './hooks/useVoiceCommands';

// --- 1. COMPONENTES VISUALES GLOBALES ---

// Fondo de Lluvia de Estrellas
const StarBackground = () => {
  const stars = new Array(30).fill(0).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 5}s`
  }));

  return (
    <div className="star-container">
      {stars.map((star) => (
        <div key={star.id} className="star" style={{ left: star.left, animationDuration: star.duration, animationDelay: star.delay }} />
      ))}
    </div>
  );
};

// Cabecera Galáctica
const Header = ({ title, onBack }) => (
  <div className="navbar">
    <button onClick={onBack} style={{background:'none', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer', display:'flex', alignItems:'center'}}>
      <span className="material-icons-round">arrow_back_ios</span>
    </button>
    <span className="navbar-title">{title}</span>
    <div style={{width: 24}}></div>
  </div>
);

// Botón Animado Genérico
const AnimatedButton = ({ onClick, className, children, style }) => (
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={className} onClick={onClick} style={style}>
    {children}
  </motion.button>
);

// Modal (Ventana Emergente)
const Modal = ({ isOpen, onClose, title, children, type }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
        >
          <div className={`modal-header ${type}`}><h3>{title}</h3></div>
          <div className="modal-body">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Botón "LEER PANTALLA" Global
const LeerPantallaButton = ({ currentView, ubicacion, lugaresCant, contactosCant }) => {
  const leerPantalla = () => {
    let texto = '';

    if (currentView === 'dashboard') {
      texto = `Estás en el inicio de OpenBlind. Tu ubicación actual es ${ubicacion}. Tienes ${lugaresCant} lugares favoritos y ${contactosCant} contactos de emergencia. Usa los comandos de voz o toca las tarjetas para navegar.`;
    } else if (currentView === 'lugares') {
      texto = `Estás en lugares favoritos. Tienes ${lugaresCant} lugares guardados. Tu ubicación actual es ${ubicacion}.`;
    } else if (currentView === 'contactos') {
      texto = `Estás en contactos de emergencia. Tienes ${contactosCant} contactos guardados. Presiona el botón rojo grande para llamar en caso de emergencia.`;
    } else if (currentView === 'rutas') {
      texto = `Estás en rutas y navegación. Puedes ver el mapa, buscar destinos y guardar tus rutas favoritas.`;
    } else if (currentView === 'ubicacion') {
      texto = `Estás en mi ubicación. Tu ubicación actual es ${ubicacion}. Puedes ver tu posición en el mapa, compartirla o guardarla como favorita.`;
    }

    hablar(texto);
  };

  return (
    <motion.button
      className="btn-leer-pantalla"
      onClick={leerPantalla}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <span className="material-icons-round">volume_up</span>
      LEER PANTALLA
    </motion.button>
  );
};

// --- 2. VISTAS DE LA APLICACIÓN ---

// --- VISTA DASHBOARD (CARRUSEL 3D + HERO UBICACIÓN) ---
const Dashboard = ({ onChangeView, ubicacion, onLogout, nombreCliente }) => {
  const modules = [
    { id: 'lugares', title: "Lugares", icon: "bookmark", desc: "Tus sitios favoritos", color: "#b026ff" },
    { id: 'contactos', title: "Contactos", icon: "contacts", desc: "Llamada rápida", color: "#ffae00" },
    { id: 'rutas', title: "Rutas", icon: "route", desc: "Navegación con mapa", color: "#00d4ff" },
    { id: 'ubicacion', title: "Ubicación", icon: "my_location", desc: "¿Dónde estoy?", color: "#ff007f" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleVoiceCommand = (command) => {
    console.log('Comando Dashboard:', command);
    if (command.includes('lugares') || command.includes('lugar')) {
      hablar('Abriendo lugares favoritos');
      onChangeView('lugares');
    } else if (command.includes('contactos') || command.includes('contacto')) {
      hablar('Abriendo contactos de emergencia');
      onChangeView('contactos');
    } else if (command.includes('rutas') || command.includes('ruta') || command.includes('navega')) {
      hablar('Abriendo rutas y navegación');
      onChangeView('rutas');
    } else if (command.includes('ubicación') || command.includes('ubicacion') || command.includes('donde')) {
      hablar('Abriendo ubicación actual');
      onChangeView('ubicacion');
    } else if (command.includes('salir') || command.includes('cerrar sesión') || command.includes('logout')) {
      hablar('Cerrando sesión');
      onLogout();
    }
  };

  const { isListening, toggleListening } = useVoiceCommands(handleVoiceCommand);

  const handleDragEnd = (event, info) => {
    const threshold = 50;
    if (info.offset.x < -threshold && activeIndex < modules.length - 1) setActiveIndex(activeIndex + 1);
    else if (info.offset.x > threshold && activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  return (
    <div className="mobile-container">
       <nav className="navbar">
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
           <span style={{fontSize:'1.8rem'}}>🪐</span>
           <span className="navbar-title">OpenBlind</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <span style={{fontSize:'0.9rem', opacity:0.8}}>{nombreCliente}</span>
          <AnimatedButton className="navbar-btn" onClick={onLogout} title="Cerrar sesión">
             <span className="material-icons-round">logout</span>
          </AnimatedButton>
        </div>
      </nav>

      {/* HERO SECTION - Ubicación Actual */}
      <motion.div
        className="hero-ubicacion"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="material-icons-round" style={{fontSize:'1.5rem', color:'#F59E0B'}}>place</span>
        <div>
          <small style={{opacity:0.9, fontSize:'0.75rem', display:'block', marginBottom:'0.25rem'}}>ESTÁS EN:</small>
          <p style={{margin:0, fontWeight:'bold', fontSize:'0.95rem', lineHeight:'1.3'}}>{ubicacion}</p>
        </div>
      </motion.div>

      <div className="carousel-container">
        <div className="carousel-track">
          <AnimatePresence>
            {modules.map((module, index) => {
              let position = index - activeIndex;
              if (Math.abs(position) > 1) return null;

              return (
                <motion.div
                  key={module.id}
                  className="swipe-card"
                  drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd}
                  onClick={() => position === 0 && onChangeView(module.id)}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    x: position * 320,
                    scale: position === 0 ? 1 : 0.85,
                    opacity: position === 0 ? 1 : 0.4,
                    zIndex: position === 0 ? 10 : 5,
                    rotateY: position * -10
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ borderColor: position === 0 ? module.color : 'transparent', boxShadow: position === 0 ? `0 0 30px ${module.color}44` : 'none' }}
                >
                  <span className="material-icons-round card-icon-large" style={{color: module.color}}>{module.icon}</span>
                  <h2 className="card-title-large">{module.title}</h2>
                  <p className="card-desc-large">{module.desc}</p>
                  {position === 0 && (
                     <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} style={{marginTop:'2rem', background:'rgba(255,255,255,0.1)', padding:'0.5rem 1rem', borderRadius:'20px', fontSize:'0.8rem', letterSpacing:'1px'}}>
                        TOCA PARA ABRIR
                     </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <div className="indicators">
          {modules.map((_, idx) => <div key={idx} className={`dot ${idx === activeIndex ? 'active' : ''}`} />)}
        </div>
      </div>

      <div style={{padding:'0 2rem 2rem'}}>
         <motion.button
          className="voice-main-btn"
          style={{
            background: isListening ? 'linear-gradient(90deg, #ff007f, #ffae00)' : 'linear-gradient(90deg, #b026ff, #00d4ff)',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
          onClick={toggleListening}
          animate={ isListening ? { boxShadow: ["0 0 0 0px rgba(255, 0, 127, 0.7)", "0 0 0 20px rgba(255, 0, 127, 0)"] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
         >
           <span className="material-icons-round">{isListening ? 'mic' : 'mic_none'}</span>
           {isListening ? 'ESCUCHANDO...' : 'COMANDO DE VOZ'}
         </motion.button>
         {isListening && (
           <motion.p
             initial={{opacity:0}}
             animate={{opacity:1}}
             style={{color:'white', textAlign:'center', marginTop:'1rem', fontSize:'0.9rem'}}>
             Di: "Lugares", "Contactos", "Rutas" o "Ubicación"
           </motion.p>
         )}
      </div>
    </div>
  );
};

// --- VISTA RUTAS (NUEVA - Con Mapa Integrado) ---
const RutasView = ({ onBack, ubicacion }) => {
  const [destino, setDestino] = useState('');
  const [rutas, setRutas] = useState(() => JSON.parse(localStorage.getItem('ob_rutas')) || []);

  useEffect(() => {
    localStorage.setItem('ob_rutas', JSON.stringify(rutas));
  }, [rutas]);

  const guardarRuta = () => {
    if (!destino.trim()) {
      hablar('Por favor escribe un destino');
      return;
    }

    const nombre = prompt('Nombre para esta ruta:', destino);
    if (!nombre) return;

    const nuevaRuta = {
      id: Date.now(),
      nombre: nombre,
      destino: destino,
      fechaCreacion: new Date().toLocaleDateString()
    };

    setRutas([...rutas, nuevaRuta]);
    hablar(`Ruta ${nombre} guardada correctamente`);
  };

  const eliminarRuta = (id, nombre) => {
    if (!confirm(`¿Eliminar ruta ${nombre}?`)) return;
    setRutas(rutas.filter(r => r.id !== id));
    hablar('Ruta eliminada');
  };

  const navegarARuta = (ruta) => {
    hablar(`Iniciando navegación hacia ${ruta.destino}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ruta.destino)}&travelmode=walking`, '_blank');
  };

  return (
    <div className="mobile-container">
      <Header title="Rutas y Navegación" onBack={onBack} />

      <div className="view-content" style={{paddingTop:'1rem'}}>
        {/* Buscador de destino */}
        <div style={{padding:'0 1.5rem', marginBottom:'1rem'}}>
          <div className="form-group" style={{marginBottom:'1rem'}}>
            <label className="form-label" style={{color:'white', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
              <span className="material-icons-round">search</span>
              Buscar Destino
            </label>
            <input
              className="form-input"
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Ej: Quito, Ecuador"
              style={{fontSize:'1rem'}}
            />
          </div>

          {/* Mapa integrado */}
          {destino && (
            <motion.div
              className="map-container"
              initial={{opacity:0, height:0}}
              animate={{opacity:1, height:'200px'}}
              transition={{duration:0.3}}
              style={{
                width:'100%',
                borderRadius:'15px',
                overflow:'hidden',
                border:'3px solid rgba(176, 38, 255, 0.5)',
                marginBottom:'1rem',
                boxShadow:'0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(destino)}&output=embed&z=15`}
                style={{border:0}}
                allowFullScreen
              />
            </motion.div>
          )}

          <AnimatedButton
            className="voice-main-btn"
            style={{background:'linear-gradient(90deg, #F59E0B, #b026ff)', height:'60px', marginBottom:'0.5rem'}}
            onClick={guardarRuta}
          >
            <span className="material-icons-round">bookmark_add</span>
            GUARDAR ESTA RUTA
          </AnimatedButton>

          {destino && (
            <AnimatedButton
              className="voice-main-btn"
              style={{background:'linear-gradient(90deg, #10B981, #00d4ff)', height:'60px'}}
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=walking`, '_blank')}
            >
              <span className="material-icons-round">directions_walk</span>
              IR AHORA (GOOGLE MAPS)
            </AnimatedButton>
          )}
        </div>

        {/* Lista de rutas guardadas */}
        <div style={{padding:'0 1.5rem'}}>
          <h3 style={{color:'white', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <span className="material-icons-round">bookmarks</span>
            Mis Rutas Guardadas ({rutas.length})
          </h3>

          {rutas.length === 0 ? (
            <div style={{textAlign:'center', padding:'3rem 1rem', opacity:0.7}}>
              <span className="material-icons-round" style={{fontSize:'4rem', color:'white'}}>route</span>
              <p style={{color:'white', marginTop:'1rem'}}>No tienes rutas guardadas</p>
            </div>
          ) : (
            <AnimatePresence>
              {rutas.map((ruta, i) => (
                <motion.div
                  key={ruta.id}
                  className="premium-card"
                  layout
                  initial={{opacity:0, x:-50}}
                  animate={{opacity:1, x:0}}
                  exit={{opacity:0, x:50}}
                  transition={{delay: i * 0.1}}
                  style={{marginBottom:'1rem'}}
                >
                  <div style={{display:'flex', alignItems:'flex-start', gap:'1rem', marginBottom:'1rem'}}>
                    <div className="avatar-circle" style={{background:'linear-gradient(135deg, #00d4ff, #b026ff)'}}>
                      <span className="material-icons-round">route</span>
                    </div>
                    <div style={{flex:1}}>
                      <h4 className="info-title">{ruta.nombre}</h4>
                      <p className="info-subtitle">
                        <span className="material-icons-round" style={{fontSize:14}}>place</span> {ruta.destino}
                      </p>
                      <p style={{fontSize:'0.75rem', opacity:0.7, marginTop:'0.25rem'}}>
                        Guardada el {ruta.fechaCreacion}
                      </p>
                    </div>
                  </div>

                  <div style={{display:'flex', gap:'0.75rem'}}>
                    <motion.button
                      className="action-btn-mini call"
                      style={{flex:1, background:'linear-gradient(135deg, #10B981, #059669)', height:'45px'}}
                      onClick={() => navegarARuta(ruta)}
                      whileHover={{scale:1.05}}
                      whileTap={{scale:0.95}}
                    >
                      <span className="material-icons-round">directions</span> IR
                    </motion.button>
                    <AnimatedButton
                      className="action-btn-mini delete"
                      onClick={() => eliminarRuta(ruta.id, ruta.nombre)}
                    >
                      <span className="material-icons-round">delete_outline</span>
                    </AnimatedButton>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

// --- VISTA LUGARES (CRUD COMPLETO CON BACKEND) ---
const LugaresView = ({ onBack, clienteId }) => {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    idLugar: null,
    nombreLugar: '',
    direccionLugar: '',
    categoriaLugar: 'Casa',
    descripcionLugar: ''
  });

  const categorias = [
    { value: 'Casa', icon: 'home', emoji: '🏠' },
    { value: 'Trabajo', icon: 'business', emoji: '💼' },
    { value: 'Hospital', icon: 'local_hospital', emoji: '🏥' },
    { value: 'Tienda', icon: 'store', emoji: '🛒' },
    { value: 'Parque', icon: 'park', emoji: '🌳' },
    { value: 'Restaurante', icon: 'restaurant', emoji: '🍽️' },
    { value: 'Otro', icon: 'place', emoji: '📍' }
  ];

  useEffect(() => {
    cargarLugares();
  }, []);

  const cargarLugares = async () => {
    try {
      setLoading(true);
      const data = await lugaresService.getAll();
      setLugares(Array.isArray(data) ? data : []);
      hablar(`Tienes ${(Array.isArray(data) ? data : []).length} lugares favoritos`);
    } catch (error) {
      console.error('Error al cargar lugares:', error);
      hablar('Error al cargar lugares. Verifica tu conexión con el servidor.');
      setLugares([]);
    } finally {
      setLoading(false);
    }
  };

  // Comandos de voz para Lugares
  const handleVoiceCommand = (command) => {
    console.log('Comando Lugares:', command);
    if (command.includes('nuevo') || command.includes('agregar') || command.includes('añadir')) {
      hablar('Abriendo formulario nuevo lugar');
      openEditModal();
    } else if (command.includes('volver') || command.includes('atrás') || command.includes('regresar')) {
      hablar('Volviendo');
      onBack();
    } else if (command.includes('guardar')) {
      if (isEditOpen) {
        hablar('Guardando lugar');
        handleSave();
      }
    } else if (command.includes('cancelar')) {
      if (isEditOpen) {
        hablar('Cancelando');
        setIsEditOpen(false);
      }
    } else {
      // Buscar lugar por nombre
      const lugarEncontrado = lugaresService.buscarPorNombre(command, lugares);
      if (lugarEncontrado) {
        hablar(`Encontré ${lugarEncontrado.nombreLugar}. ¿Quieres navegar?`);
        setTimeout(() => navegarALugar(lugarEncontrado), 2000);
      }
    }
  };

  const { isListening, toggleListening } = useVoiceCommands(handleVoiceCommand);

  const openEditModal = (item = null) => {
    setCurrentItem(item || {
      idLugar: null,
      nombreLugar: '',
      direccionLugar: '',
      categoriaLugar: 'Casa',
      descripcionLugar: ''
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!currentItem.nombreLugar.trim() || !currentItem.direccionLugar.trim()) {
      hablar('Por favor completa el nombre y la dirección');
      return;
    }

    try {
      const lugarData = {
        ...currentItem,
        clienteIdCliente: clienteId,
        estadoLugar: 'activo'
      };

      if (currentItem.idLugar) {
        await lugaresService.update(currentItem.idLugar, lugarData);
        hablar(`${currentItem.nombreLugar} actualizado`);
      } else {
        await lugaresService.create(lugarData);
        hablar(`${currentItem.nombreLugar} agregado a favoritos`);
      }

      setIsEditOpen(false);
      cargarLugares();
    } catch (error) {
      console.error('Error:', error);
      hablar('Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await lugaresService.delete(currentItem.idLugar);
      hablar(`${currentItem.nombreLugar} eliminado`);
      setIsDeleteOpen(false);
      cargarLugares();
    } catch (error) {
      console.error('Error:', error);
      hablar('Error al eliminar');
    }
  };

  const navegarALugar = (lugar) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lugar.direccionLugar)}&travelmode=walking`;
    window.open(url, '_blank');
    hablar(`Abriendo navegación a ${lugar.nombreLugar}`);
  };

  const getCategoriaIcon = (categoria) => {
    const cat = categorias.find(c => c.value === categoria);
    return cat ? cat.icon : 'place';
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <Header title="Mis Lugares" onBack={onBack} />
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'70vh', color:'white'}}>
          <motion.div animate={{rotate:360}} transition={{duration:1, repeat:Infinity, ease:"linear"}}>
            <span className="material-icons-round" style={{fontSize:'3rem'}}>hourglass_empty</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <Header title="Mis Lugares" onBack={onBack} />
      <div className="view-content">
        <AnimatePresence>
          {lugares.map((lugar, i) => (
            <motion.div
              key={lugar.idLugar} className="premium-card" layout
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.1 }}
            >
              <div className="avatar-circle"><span className="material-icons-round">{getCategoriaIcon(lugar.categoriaLugar)}</span></div>
              <div className="info-container">
                <h4 className="info-title">{lugar.nombreLugar}</h4>
                <p className="info-subtitle"><span className="material-icons-round" style={{fontSize:14}}>place</span> {lugar.direccionLugar}</p>
              </div>
              <div className="action-buttons">
                 <motion.button className="action-btn-mini call" style={{background:'linear-gradient(135deg, #00d4ff, #b026ff)'}} onClick={() => navegarALugar(lugar)} whileHover={{scale:1.1}} whileTap={{scale:0.9}}>
                   <span className="material-icons-round">directions</span>
                 </motion.button>
                 <AnimatedButton className="action-btn-mini" onClick={() => openEditModal(lugar)}><span className="material-icons-round">edit</span></AnimatedButton>
                 <AnimatedButton className="action-btn-mini delete" onClick={() => { setCurrentItem(lugar); setIsDeleteOpen(true); }}><span className="material-icons-round">delete_outline</span></AnimatedButton>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="fab-container"><AnimatedButton className="btn-fab" onClick={() => openEditModal()}><span className="material-icons-round">add</span> Nuevo</AnimatedButton></div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={currentItem.nombreLugar ? "Editar Lugar" : "Nuevo Lugar"}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={currentItem.nombreLugar} onChange={(e)=>setCurrentItem({...currentItem, nombreLugar:e.target.value})} placeholder="Ej. Casa" />
          </div>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-input" value={currentItem.categoriaLugar} onChange={(e)=>setCurrentItem({...currentItem, categoriaLugar:e.target.value})}>
              {categorias.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.emoji} {cat.value}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input className="form-input" value={currentItem.direccionLugar} onChange={(e)=>setCurrentItem({...currentItem, direccionLugar:e.target.value})} placeholder="Ej. Av. Amazonas" />
          </div>
          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <textarea className="form-input" rows="2" value={currentItem.descripcionLugar || ''} onChange={(e)=>setCurrentItem({...currentItem, descripcionLugar:e.target.value})} placeholder="Referencias adicionales..." />
          </div>
          <div className="modal-actions"><button className="btn-modal btn-cancel" onClick={()=>setIsEditOpen(false)}>Cancelar</button><button className="btn-modal btn-confirm" onClick={handleSave}>Guardar</button></div>
      </Modal>
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Eliminar" type="danger">
         <div style={{textAlign:'center', padding: '1rem'}}>¿Borrar <strong>{currentItem.nombreLugar}</strong>?</div>
         <div className="modal-actions"><button className="btn-modal btn-cancel" onClick={()=>setIsDeleteOpen(false)}>Cancelar</button><button className="btn-modal btn-delete" onClick={handleDelete}>Borrar</button></div>
      </Modal>
    </div>
  );
};

// --- VISTA CONTACTOS (CRUD COMPLETO CON BACKEND + EMERGENCIA CON SONIDO) ---
const ContactosView = ({ onBack, clienteId }) => {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState({
    idContactoEmergencia: null,
    nombreContacto: '',
    telefonoContacto: '',
    relacionContacto: 'Familiar',
    prioridadContacto: 1
  });

  const relaciones = [
    { value: 'Mamá', emoji: '👩' },
    { value: 'Papá', emoji: '👨' },
    { value: 'Hijo/Hija', emoji: '👶' },
    { value: 'Médico', emoji: '⚕️' },
    { value: 'Enfermero/a', emoji: '💉' },
    { value: 'Cuidador/a', emoji: '🤝' },
    { value: 'Familiar', emoji: '👨‍👩‍👦' },
    { value: 'Amigo/a', emoji: '👥' },
    { value: 'Otro', emoji: '👤' }
  ];

  useEffect(() => {
    cargarContactos();
  }, []);

  const cargarContactos = async () => {
    try {
      setLoading(true);
      const data = await contactosService.getAll(clienteId);
      const ordenados = (Array.isArray(data) ? data : []).sort((a, b) => a.prioridadContacto - b.prioridadContacto);
      setContactos(ordenados);
      hablar(`Tienes ${ordenados.length} contactos de emergencia`);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      hablar('Error al cargar contactos. Verifica tu conexión con el servidor.');
      setContactos([]);
    } finally {
      setLoading(false);
    }
  };

  const llamarContacto = (contacto) => {
    hablar(`Llamando a ${contacto.nombreContacto}`);
    setTimeout(() => contactosService.llamar(contacto.telefonoContacto), 1000);
  };

  // Función mejorada de emergencia con sonido de alerta
  const llamarEmergencia = async () => {
    // 1. Emitir sonido de emergencia
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 800;
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Error AudioContext:', e);
    }

    // 2. Obtener y llamar al contacto prioritario
    try {
      const contacto = await contactosService.getPrioritario(clienteId);
      if (contacto) {
        hablar(`¡Emergencia! Llamando a ${contacto.nombreContacto}`);
        setTimeout(() => contactosService.llamar(contacto.telefonoContacto), 1500);
      } else {
        hablar('No tienes contactos de emergencia configurados');
      }
    } catch (error) {
      console.error('Error:', error);
      if (contactos.length > 0) {
        llamarContacto(contactos[0]);
      } else {
        hablar('No hay contactos disponibles');
      }
    }
  };

  // Comandos de voz para Contactos
  const handleVoiceCommand = (command) => {
    console.log('Comando Contactos:', command);
    if (command.includes('emergencia') || command.includes('ayuda') || command.includes('socorro') || command.includes('sos')) {
      hablar('Activando emergencia');
      llamarEmergencia();
    } else if (command.includes('nuevo') || command.includes('agregar') || command.includes('añadir')) {
      hablar('Abriendo formulario nuevo contacto');
      openEditModal();
    } else if (command.includes('volver') || command.includes('atrás') || command.includes('regresar')) {
      hablar('Volviendo');
      onBack();
    } else if (command.includes('guardar')) {
      if (isEditOpen) {
        hablar('Guardando contacto');
        handleSave();
      }
    } else if (command.includes('cancelar')) {
      if (isEditOpen) {
        hablar('Cancelando');
        setIsEditOpen(false);
      }
    } else if (command.includes('llamar')) {
      // Buscar contacto por nombre
      const contactoEncontrado = contactos.find(c =>
        command.toLowerCase().includes(c.nombreContacto.toLowerCase())
      );
      if (contactoEncontrado) {
        llamarContacto(contactoEncontrado);
      } else if (contactos.length > 0) {
        hablar('¿A quién quieres llamar?');
      }
    }
  };

  const { isListening, toggleListening } = useVoiceCommands(handleVoiceCommand);

  const openEditModal = (c = null) => {
    const siguientePrioridad = contactos.length > 0
      ? Math.max(...contactos.map(ct => ct.prioridadContacto)) + 1
      : 1;

    setCurrentContact(c || {
      idContactoEmergencia: null,
      nombreContacto: '',
      telefonoContacto: '',
      relacionContacto: 'Familiar',
      prioridadContacto: siguientePrioridad
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!currentContact.nombreContacto.trim() || !currentContact.telefonoContacto.trim()) {
      hablar('Por favor completa el nombre y el teléfono');
      return;
    }

    try {
      const contactoData = {
        ...currentContact,
        clienteIdCliente: clienteId,
        estadoContacto: 'activo'
      };

      if (currentContact.idContactoEmergencia) {
        await contactosService.update(currentContact.idContactoEmergencia, contactoData);
        hablar(`${currentContact.nombreContacto} actualizado`);
      } else {
        await contactosService.create(contactoData);
        hablar(`${currentContact.nombreContacto} agregado a contactos`);
      }

      setIsEditOpen(false);
      cargarContactos();
    } catch (error) {
      console.error('Error:', error);
      hablar('Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await contactosService.delete(currentContact.idContactoEmergencia);
      hablar(`${currentContact.nombreContacto} eliminado`);
      setIsDeleteOpen(false);
      cargarContactos();
    } catch (error) {
      console.error('Error:', error);
      hablar('Error al eliminar');
    }
  };

  const getRelacionEmoji = (relacion) => {
    const rel = relaciones.find(r => r.value === relacion);
    return rel ? rel.emoji : '👤';
  };

  const getPrioridadColor = (prioridad) => {
    if (prioridad === 1) return '#DC2626';
    if (prioridad === 2) return '#F59E0B';
    if (prioridad === 3) return '#10B981';
    return '#6B7280';
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <Header title="Contactos" onBack={onBack} />
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'70vh', color:'white'}}>
          <motion.div animate={{rotate:360}} transition={{duration:1, repeat:Infinity, ease:"linear"}}>
            <span className="material-icons-round" style={{fontSize:'3rem'}}>hourglass_empty</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <Header title="Contactos" onBack={onBack} />

      {/* BOTÓN DE EMERGENCIA CON SONIDO */}
      <div style={{padding:'1.5rem 1.5rem 0'}}>
        <motion.button
          className="voice-main-btn"
          style={{
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            height: '90px',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
          onClick={llamarEmergencia}
          animate={{ boxShadow: ["0 0 0 0px rgba(220, 38, 38, 0.7)", "0 0 0 20px rgba(220, 38, 38, 0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{scale:1.02}}
          whileTap={{scale:0.98}}
        >
          <span className="material-icons-round" style={{fontSize:'2.5rem'}}>emergency</span>
          ¡EMERGENCIA SOS!
        </motion.button>
        <p style={{textAlign:'center', color:'rgba(255,255,255,0.7)', marginTop:'0.75rem', fontSize:'0.85rem'}}>
          Emite alerta sonora y llama al contacto prioritario
        </p>
      </div>

      <div className="view-content" style={{paddingTop:'1rem'}}>
        <AnimatePresence>
          {contactos.map((contact, i) => (
            <motion.div
              key={contact.idContactoEmergencia} className="premium-card" layout
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: i * 0.1 }}
            >
              <div className="avatar-circle" style={{background:'linear-gradient(135deg, #ffae00, #ff007f)', fontSize:'1.8rem'}}>
                {getRelacionEmoji(contact.relacionContacto)}
              </div>
              <div className="info-container">
                <h4 className="info-title">{contact.nombreContacto}
                  <span style={{
                    marginLeft:'0.5rem',
                    fontSize:'0.7rem',
                    background: getPrioridadColor(contact.prioridadContacto),
                    color:'white',
                    padding:'0.15rem 0.4rem',
                    borderRadius:'8px',
                    fontWeight:'bold'
                  }}>
                    #{contact.prioridadContacto}
                  </span>
                </h4>
                <p className="info-subtitle"><span className="material-icons-round" style={{fontSize:14}}>phone</span> {contact.telefonoContacto}</p>
              </div>
              <div className="action-buttons">
                 <motion.button
                   className="action-btn-mini call"
                   onClick={() => llamarContacto(contact)}
                   animate={{scale:[1,1.1,1]}}
                   transition={{repeat:Infinity, duration:1.5}}
                 >
                   <span className="material-icons-round">call</span>
                 </motion.button>
                 <AnimatedButton className="action-btn-mini" onClick={() => openEditModal(contact)}><span className="material-icons-round">edit</span></AnimatedButton>
                 <AnimatedButton className="action-btn-mini delete" onClick={() => { setCurrentContact(contact); setIsDeleteOpen(true); }}><span className="material-icons-round">delete_outline</span></AnimatedButton>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="fab-container"><AnimatedButton className="btn-fab" onClick={() => openEditModal()}><span className="material-icons-round">person_add</span> Nuevo</AnimatedButton></div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={currentContact.nombreContacto ? "Editar Contacto" : "Nuevo Contacto"}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={currentContact.nombreContacto} onChange={(e)=>setCurrentContact({...currentContact, nombreContacto:e.target.value})} placeholder="Ej. María García" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-input" type="tel" value={currentContact.telefonoContacto} onChange={(e)=>setCurrentContact({...currentContact, telefonoContacto:e.target.value})} placeholder="099..." />
          </div>
          <div className="form-group">
            <label className="form-label">Relación</label>
            <select className="form-input" value={currentContact.relacionContacto} onChange={(e)=>setCurrentContact({...currentContact, relacionContacto:e.target.value})}>
              {relaciones.map(rel => (
                <option key={rel.value} value={rel.value}>{rel.emoji} {rel.value}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Prioridad (1 = máxima)</label>
            <input className="form-input" type="number" min="1" max="10" value={currentContact.prioridadContacto} onChange={(e)=>setCurrentContact({...currentContact, prioridadContacto:parseInt(e.target.value)})} />
            <small style={{fontSize:'0.75rem', color:'rgba(255,255,255,0.6)', marginTop:'0.25rem', display:'block'}}>
              El botón EMERGENCIA llamará al contacto con prioridad 1
            </small>
          </div>
          <div className="modal-actions"><button className="btn-modal btn-cancel" onClick={()=>setIsEditOpen(false)}>Cancelar</button><button className="btn-modal btn-confirm" onClick={handleSave}>Guardar</button></div>
      </Modal>
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Eliminar" type="danger">
         <div style={{textAlign:'center', padding: '1rem'}}>¿Borrar a <strong>{currentContact.nombreContacto}</strong>?</div>
         <div className="modal-actions"><button className="btn-modal btn-cancel" onClick={()=>setIsDeleteOpen(false)}>Cancelar</button><button className="btn-modal btn-delete" onClick={handleDelete}>Borrar</button></div>
      </Modal>
    </div>
  );
};

// --- VISTA UBICACIÓN (GPS REAL) ---
const UbicacionView = ({ onBack }) => {
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  const obtenerUbicacion = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      setLoading(false);
      hablar('Geolocalización no disponible');
      return;
    }

    hablar('Obteniendo tu ubicación');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUbicacion({
          latitud: latitude,
          longitud: longitude,
          precision: position.coords.accuracy
        });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
          );
          const data = await response.json();
          if (data.display_name) {
            setDireccion(data.display_name);
          }
        } catch (err) {
          console.error('Error geocodificación:', err);
        }

        setLoading(false);
        hablar(`Ubicación encontrada. Precisión de ${Math.round(position.coords.accuracy)} metros`);
      },
      (err) => {
        console.error('Error geolocalización:', err);
        let mensaje = 'No se pudo obtener ubicación';

        if (err.code === 1) mensaje = 'Permiso denegado';
        else if (err.code === 2) mensaje = 'Posición no disponible';
        else if (err.code === 3) mensaje = 'Tiempo agotado';

        setError(mensaje);
        setLoading(false);
        hablar('Error al obtener ubicación');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const abrirEnMaps = () => {
    if (!ubicacion) return;
    const url = `https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`;
    window.open(url, '_blank');
    hablar('Abriendo en Google Maps');
  };

  const compartirUbicacion = () => {
    if (!ubicacion) return;
    const texto = `Mi ubicación: https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`;

    if (navigator.share) {
      navigator.share({ title: 'Mi Ubicación', text: texto })
        .catch(err => console.log('Error compartir:', err));
      hablar('Compartiendo ubicación');
    } else {
      navigator.clipboard.writeText(texto)
        .then(() => {
          alert('Ubicación copiada');
          hablar('Ubicación copiada');
        })
        .catch(() => hablar('Error al compartir'));
    }
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <Header title="Mi Ubicación" onBack={onBack} />
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'70vh', color:'white', padding:'2rem', textAlign:'center'}}>
          <motion.div animate={{rotate:360}} transition={{duration:1, repeat:Infinity, ease:"linear"}}>
            <span className="material-icons-round" style={{fontSize:'4rem'}}>my_location</span>
          </motion.div>
          <p style={{marginTop:'2rem', fontSize:'1.2rem'}}>Obteniendo tu ubicación...</p>
          <p style={{marginTop:'1rem', fontSize:'0.9rem', opacity:0.7}}>Por favor, permite el acceso</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-container">
        <Header title="Mi Ubicación" onBack={onBack} />
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'70vh', color:'white', padding:'2rem', textAlign:'center'}}>
          <span className="material-icons-round" style={{fontSize:'4rem', color:'#DC2626'}}>location_off</span>
          <h3 style={{marginTop:'2rem', fontSize:'1.5rem'}}>Error de Ubicación</h3>
          <p style={{marginTop:'1rem', fontSize:'1rem', opacity:0.8}}>{error}</p>
          <motion.button
            className="voice-main-btn"
            style={{marginTop:'2rem', background:'linear-gradient(90deg, #b026ff, #00d4ff)'}}
            onClick={obtenerUbicacion}
            whileHover={{scale:1.05}}
            whileTap={{scale:0.95}}
          >
            <span className="material-icons-round">refresh</span> Intentar de Nuevo
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <Header title="Mi Ubicación" onBack={onBack} />
      <div className="view-content">
        <motion.div
          className="premium-card"
          initial={{opacity:0, y:20}}
          animate={{opacity:1, y:0}}
          style={{marginBottom:'1rem', textAlign:'center'}}
        >
          <motion.div animate={{scale:[1,1.1,1]}} transition={{duration:2, repeat:Infinity}}>
            <span className="material-icons-round" style={{fontSize:'5rem', color:'#ff007f'}}>my_location</span>
          </motion.div>
          <h3 style={{margin:'1.5rem 0 1rem', fontSize:'1.5rem', color:'white'}}>Tu Ubicación Actual</h3>

          {direccion && (
            <div style={{background:'rgba(176, 38, 255, 0.2)', padding:'1rem', borderRadius:'12px', marginBottom:'1rem'}}>
              <div style={{display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                <span className="material-icons-round" style={{color:'#b026ff', fontSize:'1.5rem'}}>place</span>
                <p style={{color:'white', fontSize:'1rem', lineHeight:'1.6', textAlign:'left'}}>{direccion}</p>
              </div>
            </div>
          )}

          {/* Mapa embebido */}
          {ubicacion && (
            <motion.div
              initial={{opacity:0, height:0}}
              animate={{opacity:1, height:'180px'}}
              transition={{duration:0.5, delay:0.3}}
              style={{
                width:'100%',
                borderRadius:'15px',
                overflow:'hidden',
                border:'3px solid rgba(255, 0, 127, 0.5)',
                marginBottom:'1.5rem',
                boxShadow:'0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}&output=embed&z=16`}
                style={{border:0}}
                allowFullScreen
              />
            </motion.div>
          )}

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginTop:'1.5rem'}}>
            <div style={{background:'rgba(255,255,255,0.1)', padding:'0.75rem', borderRadius:'10px'}}>
              <small style={{color:'rgba(255,255,255,0.6)', fontSize:'0.75rem'}}>Latitud</small>
              <p style={{color:'white', fontWeight:'bold', marginTop:'0.25rem', fontFamily:'monospace'}}>{ubicacion.latitud.toFixed(6)}</p>
            </div>
            <div style={{background:'rgba(255,255,255,0.1)', padding:'0.75rem', borderRadius:'10px'}}>
              <small style={{color:'rgba(255,255,255,0.6)', fontSize:'0.75rem'}}>Longitud</small>
              <p style={{color:'white', fontWeight:'bold', marginTop:'0.25rem', fontFamily:'monospace'}}>{ubicacion.longitud.toFixed(6)}</p>
            </div>
          </div>

          <div style={{background:'rgba(255,255,255,0.1)', padding:'0.75rem', borderRadius:'10px', marginTop:'0.75rem'}}>
            <small style={{color:'rgba(255,255,255,0.6)', fontSize:'0.75rem'}}>Precisión</small>
            <p style={{color:'white', fontWeight:'bold', marginTop:'0.25rem'}}>±{Math.round(ubicacion.precision)} metros</p>
          </div>
        </motion.div>

        <div style={{display:'flex', flexDirection:'column', gap:'1rem', padding:'0 1rem'}}>
          <motion.button
            className="voice-main-btn"
            style={{background:'linear-gradient(90deg, #00d4ff, #b026ff)', height:'70px'}}
            onClick={abrirEnMaps}
            whileHover={{scale:1.02}}
            whileTap={{scale:0.98}}
          >
            <span className="material-icons-round">map</span> Ver en Google Maps
          </motion.button>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <motion.button
              className="btn-modal btn-confirm"
              style={{padding:'1rem'}}
              onClick={compartirUbicacion}
              whileHover={{scale:1.05}}
              whileTap={{scale:0.95}}
            >
              <span className="material-icons-round">share</span> Compartir
            </motion.button>
            <motion.button
              className="btn-modal btn-cancel"
              style={{padding:'1rem'}}
              onClick={obtenerUbicacion}
              whileHover={{scale:1.05}}
              whileTap={{scale:0.95}}
            >
              <span className="material-icons-round">refresh</span> Actualizar
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PLACEHOLDER VIEW (Para Login) ---
const PlaceholderView = ({ title, icon, color, onBack }) => (
    <div className="mobile-container">
        <Header title={title} onBack={onBack} />
        <div style={{height:'80%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color: 'rgba(255,255,255,0.5)'}}>
            <span className="material-icons-round" style={{fontSize:'5rem', color: color, marginBottom:'1rem'}}>{icon}</span>
            <p>Próximamente...</p>
        </div>
    </div>
);

// --- VISTA LOGIN ---
const LoginView = ({ onLogin }) => {
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!cedula.trim()) {
      hablar('Por favor ingresa tu cédula');
      return;
    }

    setLoading(true);
    try {
      // Simular login exitoso - en producción aquí iría el endpoint real
      // Por ahora creamos/buscamos cliente automáticamente
      const clienteId = 1; // TODO: obtener del backend
      const nombre = 'Usuario'; // TODO: obtener del backend

      hablar(`Bienvenido ${nombre}`);
      onLogin(clienteId, nombre);
    } catch (error) {
      console.error('Error login:', error);
      hablar('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container">
      <div style={{padding:'40px 20px', textAlign:'center'}}>
        <motion.div
          initial={{scale:0}}
          animate={{scale:1}}
          transition={{duration:0.5}}
          style={{fontSize:'5rem', marginBottom:'20px'}}
        >
          🪐
        </motion.div>

        <h1 style={{fontSize:'2.5rem', marginBottom:'10px', background:'linear-gradient(135deg, #b026ff, #ff007f)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
          OpenBlind
        </h1>
        <p style={{opacity:0.8, marginBottom:'40px'}}>Navegación Accesible</p>

        <div style={{maxWidth:'400px', margin:'0 auto'}}>
          <input
            type="text"
            placeholder="Cédula (ejemplo: 1234567890)"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width:'100%',
              padding:'20px',
              fontSize:'1.2rem',
              borderRadius:'15px',
              border:'2px solid rgba(176, 38, 255, 0.3)',
              marginBottom:'20px',
              background:'white'
            }}
          />

          <AnimatedButton
            onClick={handleLogin}
            style={{
              width:'100%',
              padding:'20px',
              fontSize:'1.3rem',
              borderRadius:'15px',
              background:'linear-gradient(135deg, #b026ff, #ff007f)',
              color:'white',
              border:'none',
              fontWeight:'bold',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:'10px'
            }}
          >
            <span className="material-icons-round">login</span>
            {loading ? 'INGRESANDO...' : 'ENTRAR'}
          </AnimatedButton>

          <p style={{marginTop:'30px', opacity:0.6, fontSize:'0.9rem'}}>
            Si no tienes cuenta, se creará automáticamente
          </p>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [currentView, setCurrentView] = useState('login');
  const [showSplash, setShowSplash] = useState(true);
  const [ubicacionActual, setUbicacionActual] = useState('Localizando...');
  const [lugaresCant, setLugaresCant] = useState(0);
  const [contactosCant, setContactosCant] = useState(0);

  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clienteId, setClienteId] = useState(null);
  const [clienteNombre, setClienteNombre] = useState('');

  const handleLogin = (id, nombre) => {
    setClienteId(id);
    setClienteNombre(nombre);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setClienteId(null);
    setClienteNombre('');
    setIsAuthenticated(false);
    setCurrentView('login');
    hablar('Sesión cerrada');
  };

  // Obtener ubicación actual al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setUbicacionActual(data.display_name.split(',').slice(0, 2).join(','));
        } catch (e) {
          setUbicacionActual(`GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        }
      });
    }
  }, []);

  // Cargar cantidades cuando cambia clienteId
  useEffect(() => {
    if (clienteId) {
      lugaresService.getAll().then(data => setLugaresCant(Array.isArray(data) ? data.length : 0)).catch(() => setLugaresCant(0));
      contactosService.getAll(clienteId).then(data => setContactosCant(Array.isArray(data) ? data.length : 0)).catch(() => setContactosCant(0));
    }
  }, [clienteId]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <motion.div className="splash-screen" exit={{ opacity: 0 }}>
        <StarBackground />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5, rotate: 360 }} transition={{ duration: 0.8 }} style={{ fontSize: '4rem', zIndex: 20 }}>🪐</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ color: 'white', marginTop: '1rem', zIndex: 20, fontWeight: 800, letterSpacing: '2px' }}>OpenBlind</motion.h1>
      </motion.div>
    );
  }

  return (
    <>
      <StarBackground />
      <AnimatePresence mode='wait'>
        {currentView === 'login' && (
          <motion.div key="login" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <LoginView onLogin={handleLogin} />
          </motion.div>
        )}
        {currentView === 'dashboard' && isAuthenticated && (
          <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <Dashboard onChangeView={setCurrentView} ubicacion={ubicacionActual} onLogout={handleLogout} nombreCliente={clienteNombre} />
            <LeerPantallaButton currentView="dashboard" ubicacion={ubicacionActual} lugaresCant={lugaresCant} contactosCant={contactosCant} />
          </motion.div>
        )}
        {currentView === 'lugares' && isAuthenticated && (
          <motion.div key="lugares" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <LugaresView onBack={() => setCurrentView('dashboard')} clienteId={clienteId} />
            <LeerPantallaButton currentView="lugares" ubicacion={ubicacionActual} lugaresCant={lugaresCant} contactosCant={contactosCant} />
          </motion.div>
        )}
        {currentView === 'contactos' && isAuthenticated && (
          <motion.div key="contactos" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <ContactosView onBack={() => setCurrentView('dashboard')} clienteId={clienteId} />
            <LeerPantallaButton currentView="contactos" ubicacion={ubicacionActual} lugaresCant={lugaresCant} contactosCant={contactosCant} />
          </motion.div>
        )}
        {currentView === 'rutas' && isAuthenticated && (
          <motion.div key="rutas" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <RutasView onBack={() => setCurrentView('dashboard')} ubicacion={ubicacionActual} />
            <LeerPantallaButton currentView="rutas" ubicacion={ubicacionActual} lugaresCant={lugaresCant} contactosCant={contactosCant} />
          </motion.div>
        )}
        {currentView === 'ubicacion' && isAuthenticated && (
          <motion.div key="ubicacion" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <UbicacionView onBack={() => setCurrentView('dashboard')} />
            <LeerPantallaButton currentView="ubicacion" ubicacion={ubicacionActual} lugaresCant={lugaresCant} contactosCant={contactosCant} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
