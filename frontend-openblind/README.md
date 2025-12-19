# OpenBlind - Frontend

Aplicación de navegación para personas con discapacidad visual parcial y adultos mayores.

## Descripción

OpenBlind es una aplicación móvil simplificada y accesible que permite a usuarios con visión parcial y personas mayores:
- Ver su ubicación actual
- Guardar lugares favoritos
- Gestionar contactos de emergencia
- Usar comandos de voz para todas las funcionalidades

## Características Principales

### 4 Módulos Funcionales

1. **Dashboard (Home)**
   - Vista principal con acceso a todos los módulos
   - Muestra ubicación actual
   - Botón de comando de voz

2. **Ubicación Actual**
   - Muestra dirección actual via geocodificación inversa
   - Muestra coordenadas GPS
   - Mapa embebido de OpenStreetMap
   - Compartir ubicación
   - Abrir en Google Maps

3. **Lugares Favoritos (CRUD completo)**
   - Listar todos los lugares guardados
   - Crear nuevo lugar (nombre, dirección, categoría)
   - Navegar a un lugar (abre Google Maps)
   - Eliminar lugares
   - Comandos de voz: "quiero ir a [nombre]"

4. **Contactos de Emergencia (CRUD completo)**
   - Listar contactos guardados
   - Crear nuevo contacto (nombre, teléfono, relación)
   - Llamar a contacto con un toque
   - Eliminar contactos
   - Comandos de voz: "llama a [nombre]", "muestra mis contactos"

### Comandos de Voz

**En Home:**
- "lugares" / "rutas" → Abre Lugares
- "contactos" / "emergencia" → Abre Contactos
- "ubicación" / "donde estoy" → Abre Ubicación

**En Ubicación:**
- "donde estoy" → Lee la ubicación actual
- "compartir" → Comparte la ubicación
- "volver" → Regresa al inicio

**En Lugares:**
- "quiero ir a [nombre]" → Navega al lugar
- "guardar" → Guarda el nuevo lugar
- "volver" → Regresa al inicio

**En Contactos:**
- "llama a [nombre]" → Llama al contacto
- "muestra mis contactos" → Lista todos los contactos
- "guardar" → Guarda el nuevo contacto
- "volver" → Regresa al inicio

## Diseño Accesible

- **Paleta de colores para daltónicos:** Solo púrpura (#7C3AED) y ámbar (#F59E0B)
- **Texto grande:** Fuentes de 1rem o más
- **Botones grandes:** Fáciles de presionar
- **Diseño simple:** Sin animaciones complejas ni carruseles 3D
- **Fuentes:** Plus Jakarta Sans (legible y moderna)

## Tecnologías

- **React 19** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **Axios** - Cliente HTTP para conectar con backend
- **Web Speech API** - Reconocimiento y síntesis de voz
- **Geolocation API** - Obtener ubicación GPS
- **OpenStreetMap** - Mapas embebidos
- **Google Maps** - Navegación externa

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Backend corriendo en `http://localhost:8888`

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

## Construcción para Producción

```bash
# Construir aplicación
npm run build

# Previsualizar construcción
npm run preview
```

## Conexión con Backend

La aplicación se conecta al backend de Node.js + Express:

```javascript
// src/App.jsx
const api = axios.create({
  baseURL: 'http://localhost:8888',
  timeout: 10000
});
```

### Endpoints Utilizados

**Lugares Turísticos:**
- `GET /lugares-turisticos/lista` - Obtener todos los lugares
- `POST /lugares-turisticos/crear` - Crear nuevo lugar
- `DELETE /lugares-turisticos/eliminar/:id` - Eliminar lugar

**Contactos de Emergencia:**
- `GET /contactos-emergencia/cliente/:clienteId` - Obtener contactos del cliente
- `POST /contactos-emergencia/` - Crear nuevo contacto
- `DELETE /contactos-emergencia/:id` - Eliminar contacto

## Estructura de Archivos

```
frontend-openblind/
├── src/
│   ├── App.jsx          # Componente principal con todas las vistas
│   ├── index.css        # Estilos globales (paleta púrpura)
│   └── main.jsx         # Punto de entrada
├── index.html           # HTML base con fuentes de Google
├── package.json         # Dependencias
└── README.md           # Este archivo
```

## Notas de Uso

1. **Permisos necesarios:**
   - Micrófono (para comandos de voz)
   - Ubicación (para GPS)

2. **Cliente ID:**
   - Actualmente hardcodeado como `clienteId = 1`
   - Cambiar en línea 14 de App.jsx si es necesario

3. **Navegadores compatibles:**
   - Chrome/Edge (recomendado)
   - Firefox
   - Safari (con limitaciones en Web Speech API)

## Desarrollo

Este proyecto fue simplificado desde una versión compleja para cumplir con los requisitos de accesibilidad:
- ✅ Sin colores azul/verde
- ✅ Sin carrusel 3D
- ✅ Sin animaciones complejas
- ✅ Diseño simple del front-opcional
- ✅ 2 CRUDs funcionales conectados a backend
- ✅ Comandos de voz en CADA vista
- ✅ 4 módulos totales

## Autor

Proyecto para clase de desarrollo web - OpenBlind
