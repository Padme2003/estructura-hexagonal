const contactoEmergencia = (sequelize, type) => {
    return sequelize.define('contactosEmergencia', {
        idContactoEmergencia: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreContacto: type.STRING,
        telefonoContacto: type.STRING,
        relacionContacto: type.STRING, // Mamá, Papá, Hijo, Médico, etc.
        prioridadContacto: type.INTEGER, // 1, 2, 3... (1 = más prioritario)
        fotoContacto: type.STRING, // URL o path de la foto (opcional)
        estadoContacto: type.STRING,
        clienteIdCliente: type.INTEGER, // FK a tabla clientes
        createContacto: type.STRING,
        updateContacto: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Contactos de Emergencia'
    })
}

module.exports = contactoEmergencia;
