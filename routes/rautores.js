module.exports = function (app, swig) {

    app.get("/autores", function(req, res) {
        let autores = [{
            "nombre": "Mick Jagger",
            "grupo": "Rolling Stones",
            "rol": "Cantante"
        }, {
            "nombre": "John Lennon",
            "grupo": "The Beatles",
            "rol": "Cantante"
        }, {
            "nombre": "Bono",
            "grupo": "U2",
            "rol": "Cantante"
        }]

        let respuesta = swig.renderFile('views/autores.html', {
            autores : autores
        });

        res.send(respuesta);
    });

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {

        });
        res.send(respuesta);
    });

    app.post('/autor', function (req, res) {
        if(req.body.nombre == null)
            res.send("Nombre no enviado en la petición");
        else if(req.body.grupo == null)
            res.send("Grupo no enviado en la petición");
        else if(typeof (req.body.rol) == "undefined")
            res.send("Rol no enviado en la petición");
        else {
            res.send('Autor agregado:' + "<br>"
                + 'Nombre: ' + req.body.nombre + "<br>"
                + 'Grupo: ' + req.body.grupo + "<br>"
                + 'Rol: ' + req.body.rol);
        }
    });
};