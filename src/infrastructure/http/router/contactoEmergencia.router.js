const express = require('express');
const router = express.Router();

const {
    mostrarContactos,
    obtenerContacto,
    obtenerPrioritario,
    crearContacto,
    actualizarContacto,
    eliminarContacto,
    buscarPorNombre
} = require('../controllers/contactoEmergencia.controller');

// Rutas para contactos de emergencia
router.get('/cliente/:clienteId', mostrarContactos);              // Listar todos los contactos de un cliente
router.get('/prioritario/:clienteId', obtenerPrioritario);         // Obtener contacto prioritario
router.get('/buscar/:clienteId/:nombre', buscarPorNombre);         // Buscar por nombre (comandos de voz)
router.get('/:id', obtenerContacto);                               // Obtener un contacto por ID
router.post('/', crearContacto);                                   // Crear nuevo contacto
router.put('/:id', actualizarContacto);                            // Actualizar contacto
router.delete('/:id', eliminarContacto);                           // Eliminar (desactivar) contacto

module.exports = router;
