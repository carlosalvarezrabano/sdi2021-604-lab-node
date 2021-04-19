module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });

    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
        }
        // ¿Validar nombre, genero, precio?
        validaDatosAgregarFuncion(cancion, function(errors) {
           if(errors != null || errors.length > 0) {
               res.status(500);
               res.json({
                   errors : errors
               })
           }
           else {
               gestorBD.insertarCancion(cancion, function(id){
                   if (id == null) {
                       res.status(500);
                       res.json({
                           error : "se ha producido un error"
                       })
                   } else {
                       res.status(201);
                       res.json({
                           mensaje : "canción insertada",
                           _id : id
                       })
                   }
               });
           }
        });

    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });

    app.delete("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        usuarioEsAutor(req.session.usuario, criterio, function(usuario) {
            if(usuario == 'undefined' || usuario == null) {
                res.status(500);
                res.json({
                    error : "El usuario actual no puede eliminar esta cancion"
                })
            }
            else {
                gestorBD.eliminarCancion(criterio,function(canciones){
                    if ( canciones == null ){
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        res.send( JSON.stringify(canciones) );
                    }
                });
            }
        })

    });

    app.put("/api/cancion/:id", function(req, res) {

        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;

        validaDatosActualizarFuncion(cancion, function(errors) {
            if(errors.length > 0 || errors != null) {
                res.status(500);
                res.json({
                    errors : errors
                })
            }
            else {
                gestorBD.modificarCancion(criterio, cancion, function(result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        res.json({
                            mensaje : "canción modificada",
                            _id : req.params.id
                        })
                    }
                });
            }
        })

    });

    app.post("/api/autenticar", function(req, res) {
        let seguro = app.get("crypto").createHmac("sha256", app.get("clave"))
            .update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if(usuarios == null || usuarios.length == 0) {
                res.status(401); //Unauthorized
                res.json({
                    autenticado : false
                })
            }
            else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");

                res.status(200);
                res.json({
                    autenticado : true,
                    token : token
                })
            }
        });
    });

    //Funciones auxiliares
    function validaDatosAgregarFuncion(cancion, functionCallback) {
        let errors = new Array();
        if(cancion.nombre == 'undefined' || cancion.nombre == '' || cacnion.nombre == null) {
            errors.push(new Error("El campo nombre no puede estar vacío"));
        }
        if(cancion.genero == 'undefined' || cancion.genero == '' || cacnion.genero == null) {
            errors.push(new Error("El campo genero no puede estar vacío"));
        }
        if(typeof cancion.precio == 'undefined' || cancion.precio == '' || cacnion.precio == null ||
            cancion.precio < 0) {
            errors.push(new Error("El campo precio no puede estar vacío o tener valores negativos"));
        }
        functionCallback(errors);
    }

    function validaDatosActualizarFuncion(cancion, functionCallback) {
        usuarioEsAutor(req.session.usuario, cancion._id, function(usuario) {
            let errors = new Array();
            if(usuario != null) {
                if(cancion.nombre == 'undefined' || cancion.nombre == '' || cacnion.nombre == null) {
                    errors.push(new Error("El campo nombre no puede estar vacío"));
                }
                if(cancion.genero == 'undefined' || cancion.genero == '' || cacnion.genero == null) {
                    errors.push(new Error("El campo genero no puede estar vacío"));
                }
                if(cancion.precio == 'undefined' || cancion.precio == '' || typeof cacnion.precio == null
                    || cancion.precio < 0) {
                    errors.push(new Error("El campo precio no puede estar vacío o tener valores negativos"));
                }
            }
            else {
                errors.push(new Error("Este usuario no puede modificar esta cancion"));
            }
            functionCallback(errors);
        })

    }

    function usuarioEsAutor(usuario, idCancion, functionCallback) {
        let criterio_micancion = { $and: [{"_id" : cancionId}, {"autor" : usuario}] };
        gestorBD.obtenerCanciones(criterio_micancion, function(canciones) {
            if(canciones.length > 0 && canciones != null) {
                functionCallback(true);
            }
            else {
                functionCallback(false);
            }
        })
    }
}