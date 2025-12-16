const contactoEmergenciaCtl = {};
const orm = require('../../database/connection/dataBase.orm');
const sql = require('../../database/connection/dataBase.sql');
const { cifrarDatos, descifrarDatos } = require('../../../application/encrypDates');

// Función para descifrar de forma segura
const descifrarSeguro = (dato) => {
  try {
    return dato ? descifrarDatos(dato) : '';
  } catch (error) {
    console.error('Error al descifrar:', error);
    return '';
  }
};

// Mostrar todos los contactos de emergencia de un cliente
contactoEmergenciaCtl.mostrarContactos = async (req, res) => {
    try {
        const { clienteId } = req.params;

        const [listaContactos] = await sql.promise().query(
            `SELECT * FROM contactosEmergencia
             WHERE clienteIdCliente = ? AND estadoContacto = "activo"
             ORDER BY prioridadContacto ASC`,
            [clienteId]
        );

        const contactosDesencriptados = listaContactos.map(contacto => ({
            ...contacto,
            nombreContacto: descifrarSeguro(contacto.nombreContacto),
            telefonoContacto: descifrarSeguro(contacto.telefonoContacto),
            relacionContacto: descifrarSeguro(contacto.relacionContacto)
        }));

        return res.json(contactosDesencriptados);
    } catch (error) {
        console.error('Error al mostrar contactos:', error);
        return res.status(500).json({
            message: 'Error al obtener los contactos',
            error: error.message
        });
    }
};

// Obtener contacto por ID
contactoEmergenciaCtl.obtenerContacto = async (req, res) => {
    try {
        const { id } = req.params;

        const [contacto] = await sql.promise().query(
            'SELECT * FROM contactosEmergencia WHERE idContactoEmergencia = ? AND estadoContacto = "activo"',
            [id]
        );

        if (contacto.length === 0) {
            return res.status(404).json({ message: 'Contacto no encontrado' });
        }

        const contactoDesencriptado = {
            ...contacto[0],
            nombreContacto: descifrarSeguro(contacto[0].nombreContacto),
            telefonoContacto: descifrarSeguro(contacto[0].telefonoContacto),
            relacionContacto: descifrarSeguro(contacto[0].relacionContacto)
        };

        return res.json(contactoDesencriptado);
    } catch (error) {
        console.error('Error al obtener contacto:', error);
        return res.status(500).json({
            message: 'Error al obtener contacto',
            error: error.message
        });
    }
};

// Obtener contacto prioritario (para emergencias)
contactoEmergenciaCtl.obtenerPrioritario = async (req, res) => {
    try {
        const { clienteId } = req.params;

        const [contacto] = await sql.promise().query(
            `SELECT * FROM contactosEmergencia
             WHERE clienteIdCliente = ? AND estadoContacto = "activo"
             ORDER BY prioridadContacto ASC
             LIMIT 1`,
            [clienteId]
        );

        if (contacto.length === 0) {
            return res.status(404).json({ message: 'No hay contactos de emergencia' });
        }

        const contactoDesencriptado = {
            ...contacto[0],
            nombreContacto: descifrarSeguro(contacto[0].nombreContacto),
            telefonoContacto: descifrarSeguro(contacto[0].telefonoContacto),
            relacionContacto: descifrarSeguro(contacto[0].relacionContacto)
        };

        return res.json(contactoDesencriptado);
    } catch (error) {
        console.error('Error al obtener contacto prioritario:', error);
        return res.status(500).json({
            message: 'Error al obtener contacto',
            error: error.message
        });
    }
};

// Crear nuevo contacto de emergencia
contactoEmergenciaCtl.crearContacto = async (req, res) => {
    try {
        const {
            nombreContacto,
            telefonoContacto,
            relacionContacto,
            prioridadContacto,
            fotoContacto,
            clienteIdCliente
        } = req.body;

        // Validación de campos requeridos
        if (!nombreContacto || !telefonoContacto || !clienteIdCliente) {
            return res.status(400).json({
                message: 'Nombre, teléfono y cliente son obligatorios'
            });
        }

        // Crear contacto con datos encriptados
        const nuevoContacto = await orm.contactoEmergencia.create({
            nombreContacto: cifrarDatos(nombreContacto),
            telefonoContacto: cifrarDatos(telefonoContacto),
            relacionContacto: cifrarDatos(relacionContacto || 'Otro'),
            prioridadContacto: prioridadContacto || 99,
            fotoContacto: fotoContacto || '',
            estadoContacto: 'activo',
            clienteIdCliente: clienteIdCliente,
            createContacto: new Date().toLocaleString(),
        });

        return res.status(201).json({
            message: 'Contacto de emergencia creado exitosamente',
            idContacto: nuevoContacto.idContactoEmergencia
        });

    } catch (error) {
        console.error('Error al crear contacto:', error);
        return res.status(500).json({
            message: 'Error al crear el contacto',
            error: error.message
        });
    }
};

// Actualizar contacto de emergencia
contactoEmergenciaCtl.actualizarContacto = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombreContacto,
            telefonoContacto,
            relacionContacto,
            prioridadContacto,
            fotoContacto
        } = req.body;

        // Validar campos
        if (!nombreContacto || !telefonoContacto) {
            return res.status(400).json({
                message: 'Nombre y teléfono son obligatorios'
            });
        }

        // Actualizar contacto
        await sql.promise().query(
            `UPDATE contactosEmergencia SET
                nombreContacto = ?,
                telefonoContacto = ?,
                relacionContacto = ?,
                prioridadContacto = ?,
                fotoContacto = ?,
                updateContacto = ?
             WHERE idContactoEmergencia = ?`,
            [
                cifrarDatos(nombreContacto),
                cifrarDatos(telefonoContacto),
                cifrarDatos(relacionContacto || 'Otro'),
                prioridadContacto || 99,
                fotoContacto || '',
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Contacto actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar contacto:', error);
        return res.status(500).json({
            message: 'Error al actualizar',
            error: error.message
        });
    }
};

// Eliminar (desactivar) contacto de emergencia
contactoEmergenciaCtl.eliminarContacto = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE contactosEmergencia SET
                estadoContacto = 'inactivo',
                updateContacto = ?
             WHERE idContactoEmergencia = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Contacto desactivado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar contacto:', error);
        return res.status(500).json({
            message: 'Error al desactivar',
            error: error.message
        });
    }
};

// Buscar contacto por nombre (para comandos de voz)
contactoEmergenciaCtl.buscarPorNombre = async (req, res) => {
    try {
        const { clienteId, nombre } = req.params;

        const [contactos] = await sql.promise().query(
            `SELECT * FROM contactosEmergencia
             WHERE clienteIdCliente = ? AND estadoContacto = "activo"`,
            [clienteId]
        );

        // Buscar en contactos desencriptados
        const contactoEncontrado = contactos.find(c => {
            const nombreDesencriptado = descifrarSeguro(c.nombreContacto).toLowerCase();
            return nombreDesencriptado.includes(nombre.toLowerCase());
        });

        if (!contactoEncontrado) {
            return res.status(404).json({ message: 'Contacto no encontrado' });
        }

        const contactoDesencriptado = {
            ...contactoEncontrado,
            nombreContacto: descifrarSeguro(contactoEncontrado.nombreContacto),
            telefonoContacto: descifrarSeguro(contactoEncontrado.telefonoContacto),
            relacionContacto: descifrarSeguro(contactoEncontrado.relacionContacto)
        };

        return res.json(contactoDesencriptado);
    } catch (error) {
        console.error('Error al buscar contacto:', error);
        return res.status(500).json({
            message: 'Error en la búsqueda',
            error: error.message
        });
    }
};

module.exports = contactoEmergenciaCtl;
