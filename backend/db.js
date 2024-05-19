const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://kinshuokmunjal:kmunjal654@cluster0.kzwzut4.mongodb.net/");

// Create a Schema for Users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    OwnerFirstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
     OwnerLastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    InventoryId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'ShopInventory',
        required:true,
    }
});

const InventorySchema = new mongoose.Schema({
    products :[{
        barcode:{
            type:String
        },
        quantity:{
            type:Number
        },
        price:{
            type:Number
        }
    }]
});


const User = mongoose.model('User', userSchema);
const Inventory=mongoose.model('Inventory',InventorySchema);

module.exports = {
	User,
    Inventory
};