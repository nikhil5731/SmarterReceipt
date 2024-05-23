const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://kinshuokmunjal:kmunjal654@cluster0.kzwzut4.mongodb.net/SmarterReceipt", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create a Schema for Users
const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: false
    },
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
        required: function() {
            return !this.googleId; // Password is required only if googleId is not present
        },
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
    ShopName: {
        type: String,
        required: false,
        trim: true,
        maxLength: 100
    },
    InventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: false // Make InventoryId optional
    },
});

const InventorySchema = new mongoose.Schema({
    products: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    MonthlySales: {
        type: [Number],
        required: false, // Optional: Add required if necessary
        default: [10, 0, 0, 0, 0 ,0 ,0 ,0, 0, 0, 0, 0] // Optional: Default value as an empty array
    }
});

const User = mongoose.model('User', userSchema);
const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = {
    User,
    Inventory
};
