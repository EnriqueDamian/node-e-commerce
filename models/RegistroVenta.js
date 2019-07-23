var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Schema = new Schema({
    comprador:{
        idcomprador:String,
        nombre:String,
        correo:String
    },
    producto: {
        nombre: { type: String },
        precio: { type: Number },
        cantidad: { type: Number },
    },
    proceso:String,
    totalPrecio:Number,
    idcompra:String
    

});
module.exports = mongoose.model('registroventa', Schema);