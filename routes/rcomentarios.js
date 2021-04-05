module.exports = function(app, swig, gestorBD) {

    app.post('/comentarios/:cancion_id', function (req, res) {
        if(req.session.usuario == null) {
            res.send("No se puede añadir un comentario sin estar registrado.");
        }
        let comentario = {
            autor : req.session.usuario,
            texto : req.body.texto,
            cancion_id : gestorBD.mongo.ObjectID(req.params.cancion_id)
        }
        gestorBD.insertarComentario(comentario, function(result) {
            if (result == null) {
                res.send("Error al insertar comentario.");
            } else {
                res.send("Comentario añadido.");
            }
        });
    });

};