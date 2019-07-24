var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var paypal = require('paypal-rest-sdk');
var fs = require('fs');
var productos = require('../models/productos');
var Cart = require('../models/CarShop');
var Registro = require('../models/RegistroVenta');
var passport = require('passport');
var totalcant;
let costo;


router.get('/', async (req, res) => {
    var ProductosCollection = await productos.find();
    if (req.session.cart) {
        var cart = new Cart(req.session.cart.items);
        costo = cart.totalPrice;
        console.log(costo);
    }

    res.render('pages/index/index', { title: 'ZapateriaDelSur', totalcant, costo, ProductosCollection });
});

//Nosotros
router.get('/NosotrosZapateriaDelSur', function (req, res, next) {

    res.render('pages/index/nosotros', { title: 'NosotrosZapateriaDelSur' });
});

//Contacto
router.get('/ContactoZapateriaDelSur', function (req, res, next) {

    res.render('pages/index/contacto', { title: 'ContactoZapateriaDelSur' });
});

//Vision
router.get('/VisionZapateriaDelSur', function (req, res, next) {

    res.render('pages/index/vision', { title: 'VisionZapateriaDelSur' });
});

//Mision
router.get('/MisionZapateriaDelSur', function (req, res, next) {

    res.render('pages/index/mision', { title: 'MisionZapateriaDelSur' });
});

//DetalleZapata
router.get('/DetalleZapatoZapateriaDelSur/:id', async (req, res) => {
    const { id } = req.params;
    var ProductosCollection = await productos.findById(id);
    if (req.session.cart) {
        var cart = new Cart(req.session.cart.items);
        costo = cart.totalPrice;
        console.log(costo);
    }
    res.render('pages/index/detallezapato', { totalcant, costo, ProductosCollection });
});

router.get('/Miscompras', function (req, res, next) {

    res.render('pages/index/Miscompras', { title: 'MisionZapateriaDelSur' });
});
router.post('/BuscarCompra', async(req, res)=> {
    
    var regis = req.body.codigo;
    var vent= await Registro.find({idcompra:regis});
    var pre=0;
    vent.forEach(element => {
        pre=element.totalPrecio;
    });
   
   res.render('pages/index/datoscompras', { layout: false, title: 'MisionZapateriaDelSur',vent,pre});
});

//login 
router.get('/login', (req, res) => {
    var message = req.flash('loginMessage');
    res.render('pages/login', {
        message: message,
        hasError: message.length > 0
    });
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


router.get('/signup', (req, res) => {
    res.render('pages/signup', {
        message: req.flash('signupMessage')
    });
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
}));


router.get('/profile', isLoggedIn, (req, res) => {
    res.render('pages/profile', {
        user: req.user
    });
});
router.get('/logout', (req, res) => {
    req.session.destroy();
    totalcant = null;
    costo = 0;

    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}



//cart-shop

router.get('/add-to-cart/:id', function (req, res, next) {

    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart.items : {});

    productos.findById(productId, function (err, productos) {
        cart.add(productos, productos.id);
        req.session.cart = cart;
        totalcant = cart.totalQty;

        res.redirect('/DetalleZapatoZapateriaDelSur/' + productId);
    });
});

router.get('/shopping-cart', function (req, res) {
    if (!req.session.cart) {
        return res.render('pages/index/car-shop', { layout: false, products: null });
    }
    var cart = new Cart(req.session.cart.items);

    res.render('pages/index/car-shop', { layout: false, products: cart.generateArray() });
});


router.get('/pay', function (req, res, next) {
    var cart = new Cart(req.session.cart.items);
    var car = cart.generateArray();
    var items = car.map(element => {
        return {
            "name": element.item.nombre,
            "sku": element.item.nombre,
            "price": element.item.precio,
            "currency": "MXN",
            "quantity": element.qty
        }
    });

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": items
            },
            "amount": {
                "currency": "MXN",
                "total": cart.totalPrice
            },
            "description": "algo"
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {

            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel == "approval_url") {
                    res.redirect(payment.links[i].href);
                }

            }
        }
    });


});

router.get('/success', isLoggedIn, (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    var cart = new Cart(req.session.cart.items);
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "MXN",
                "total": cart.totalPrice
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            var list = payment.transactions[0].item_list.items;
            list.forEach(element => {
                var newRegistro = new Registro();

                newRegistro.comprador.idcomprador = req.user._id;
                newRegistro.comprador.nombre = req.user.local.name;
                newRegistro.comprador.correo = req.user.local.email;

                newRegistro.producto.nombre = element.name;
                newRegistro.producto.precio = element.price;
                newRegistro.producto.cantidad = element.quantity;

                newRegistro.proceso = 'Procesando';
                newRegistro.totalPrecio = payment.transactions[0].amount.total;
                newRegistro.idcompra = payment.id;
                newRegistro.save();

                
            });
        }
    });

    res.render('pages/index/ProcesoSuccess', { codigo: paymentId });
});

router.get('/cancel', (req, res) => res.send('Cancelled'));



module.exports = router;
