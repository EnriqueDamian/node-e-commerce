var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var productos = require('../models/productos');
var Registro = require('../models/RegistroVenta');
var passport = require('passport');
var compras = require('../models/RegistroVenta');

/* GET home page. */
router.get('/', isLoggedIn, async (req, res, next) => {
    var ventas = await Registro.find();
    res.render('pages/administrador/ventas/lista_ventas', { layout: 'layoutBackEnd.hbs', title: 'Administrador', ventas });
});



router.get('/listaventas', isLoggedIn, async (req, res, next) => {
    var ventas = await Registro.find();
    res.render('pages/administrador/ventas/lista_ventas', { layout: 'layoutBackEnd.hbs', title: 'Administrador', ventas });
});



/*CRUD del producto*/
router.get('/ListadoProductos', isLoggedIn, async (req, res) => {
    var ProductosCollection = await productos.find();
    console.log(ProductosCollection);
    res.render('pages/administrador/productos/listado_productos', { layout: 'layoutBackEnd.hbs', title: 'Listado de los Productos', ProductosCollection });
    // res.render('pages/productos/listado_productos', { title: 'Listado de Productos' });
});

router.get('/FormularioProductos', isLoggedIn, function (req, res, next) {

    res.render('pages/administrador/productos/formulario_productos', { layout: 'layoutBackEnd.hbs', title: 'Formulario de los Productos' });
});

router.post('/AgregarProducto', multipartMiddleware, async (req, res) => {
    console.log(req.body, req.files);

    var tmp_path = req.files.foto.path;
    var name = req.files.foto.name;
    var ext = (name.substring(name.lastIndexOf("."))).toLowerCase();
    var fechaEnMiliseg = Date.now();
    name = fechaEnMiliseg + ext;

    double_cantidad = req.body.cantidad * 1.0;

    var target_path = './public/images/product_img/' + name;

    var is = fs.createReadStream(tmp_path);
    var os = fs.createWriteStream(target_path);

    is.pipe(os);
    is.on('end', function () {
        fs.unlinkSync(tmp_path);
        var data = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            imagenUrl: name,
            categoria: req.body.categoria,
            cantidad: double_cantidad,
            talla: req.body.talla
        }
        var producto = new productos(data);
        producto.save().then(() => res.redirect('/administrador/ListadoProductos'));
    });
});

router.get('/ActualizarProductos/:id', async (req, res) => {
    const { id } = req.params;
    var ProductosCollection = await productos.findById(id);
    res.render('pages/administrador/productos/actualizar_productos', { layout: 'layoutBackEnd.hbs', ProductosCollection });
});

router.post('/CambiarEstadoVenta/:id', async (req, res) => {
    const { id } = req.params;
    var data = {
        proceso: 'Finalizado'
    }
    compras.findByIdAndUpdate(id, data, { new: true }, (err, compras) => {
        if (err) return res.status(500).send(err);
        res.redirect('/administrador/listaventas');
    })
});

router.post('/ModificarProductos/:id', multipartMiddleware, async (req, res) => {
    const { id } = req.params;
    var name1 = req.files.foto.name;

    double_cantidad = req.body.cantidad * 1.0;
    if (name1 != "") {
        var tmp_path = req.files.foto.path;
        var name = req.files.foto.name;
        var ext = (name.substring(name.lastIndexOf("."))).toLowerCase();
        var fechaEnMiliseg = Date.now();
        name = fechaEnMiliseg + ext;
        var target_path = './public/images/product_img/' + name;


        var is = fs.createReadStream(tmp_path);
        var os = fs.createWriteStream(target_path);

        is.pipe(os);
        is.on('end', function () {
            fs.unlinkSync(tmp_path);
            var data={
                nombre:req.body.nombre,
                descripcion:req.body.descripcion,
                precio:req.body.precio,
                imagenUrl:name,
                categoria:req.body.categoria,
                cantidad:double_cantidad,
                talla:req.body.talla
              }
              productos.findByIdAndUpdate(id,data,{new: true},(err, productos) => {
                if (err) return res.status(500).send(err);
                res.redirect('/administrador/ListadoProductos');
              })
        });
    }
    else {
        productos.findByIdAndUpdate(id, req.body, { new: true }, (err, productos) => {
            if (err) return res.status(500).send(err);
            res.redirect('/administrador/ListadoProductos');
        })
    }
});

router.get('/EliminarProductos/:id', async (req, res) => {
    const { id } = req.params;
    await productos.remove({ _id: id });
    res.redirect('/administrador/ListadoProductos');
});
/*CRUD del producto*/


router.get('/loginAdmin', (req, res) => {
    var message = req.flash('loginMessage');
    res.render('pages/loginAdmin', {
        layout: false,
        message: message,
        hasError: message.length > 0
    });
});

router.post('/loginAdmin', passport.authenticate('local-login', {
    successRedirect: '/administrador',
    failureRedirect: '/administrador/loginAdmin',
    failureFlash: true
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/administrador/loginAdmin');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        var id = req.user._id;
        var ia = "5d355773e0617406b4f194b2";
        if (id == ia) {
            return next();
        }

    }

    res.redirect('/');
}

module.exports = router;
