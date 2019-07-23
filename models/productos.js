var mongoose= require('mongoose');
var Schema = mongoose.Schema;
var Schema = new Schema({
	nombre:{type:String},
 	descripcion:{type:String},
 	precio:{type:Number},
 	imagenUrl:{type:String},
 	categoria:{type:String},
 	cantidad:{type:Number},
 	talla:{type:String}
});
module.exports=mongoose.model('producto',Schema);