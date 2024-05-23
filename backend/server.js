const express = require('express');
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const cors = require('cors');
const path = require('path');
const { User, Inventory } = require('./db');
const { generateUniqueInventoryId } = require('./helpers');

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(cookieSession({
    name: 'session',
    keys: ['56fb7a12f566d26973accd3014ba65e66db60ddf445a5f98f0837400aa916b34'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user.InventoryId) {
            user.InventoryId = await generateUniqueInventoryId();
            await user.save();
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: '660075968403-9erhme7sfjlosak5soglvmm7kivli605.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:8000/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            console.log('User already exists:', user);
            if (!user.InventoryId) {
                user.InventoryId = await generateUniqueInventoryId();
                await user.save();
            }
            return done(null, user);
        }

        const inventoryId = await generateUniqueInventoryId();

        const newUser = new User({
            googleId: profile.id,
            username: profile.emails[0].value,
            OwnerFirstName: profile.name.givenName,
            OwnerLastName: profile.name.familyName,
            password: undefined,
            InventoryId: inventoryId
        });

        await newUser.save();
        console.log('New user created:', newUser);
        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}));

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    console.log('Google authentication successful');
    res.redirect('http://localhost:3000');
});
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/google');  // Redirect to Google login if not authenticated
}

app.get('/api/current_user',isAuthenticated, (req, res) => {
        res.send(req.user);
});

app.post('/api/addShopName',isAuthenticated, async (req, res) => {
    const { shopName } = req.body;

        try {
            const user = await User.findById(req.user.id);
            user.ShopName = shopName;
            await user.save();
            console.log('Shop name saved:', user);
            res.send(user);
        } catch (err) {
            console.log('Error saving shop name:', err);
            res.status(500).send('Error saving shop name');
        }

});

app.get('/api/logout', (req, res) => {
    console.log('Logging out user');
    req.session = null;
    res.send({ success: true });
});

// Endpoint to add a product to the user's inventory
app.post('/api/inventory',isAuthenticated,async (req, res) => {

        try {
            const { product } = req.body;
            console.log('Received product data:', product);
            if (!product.name || !product.price || product.quantity === undefined) {
                console.log('Invalid product data:', product);
                return res.status(400).send('Invalid product data');
            }

            let inventory = await Inventory.findById(req.user.InventoryId);
            
            // Check if inventory exists, if not create a new one
            if (!inventory) {
                inventory = new Inventory({ _id: req.user.InventoryId, products: [] });
            }
            
            inventory.products.push(product);
            await inventory.save();
            res.send(inventory);
        } catch (err) {
            console.log('Error updating inventory:', err);
            res.status(500).send('Error updating inventory');
        }

});

// Endpoint to get the inventory by ID
app.get('/api/inventory/:id',isAuthenticated,async (req, res) => {
    try {
        let inventory = await Inventory.findById(req.params.id);
        
        // Check if inventory exists, if not create a new one
        if (!inventory) {
            inventory = new Inventory({ _id: req.params.id, products: [] });
            await inventory.save();
        }
        
        res.send(inventory);
    } catch (err) {
        console.log('Error fetching inventory:', err);
        res.status(500).send('Error fetching inventory');
    }
});

app.delete('/api/delete_inventory',isAuthenticated, async (req, res) => {

        try {
            await Inventory.findByIdAndDelete(req.user.InventoryId);
            req.user.InventoryId = await generateUniqueInventoryId();
            await req.user.save();
            res.send({ success: true });
        } catch (err) {
            console.log('Error deleting inventory:', err);
            res.status(500).send('Error deleting inventory');
        }

});

// Endpoint to get the products to restock (quantity = 0)
app.get('/api/products_to_restock',isAuthenticated, async (req, res) => {

        try {
            const inventory = await Inventory.findById(req.user.InventoryId);
            if (!inventory) {
                return res.status(404).send('Inventory not found');
            }
            const productsToRestock = inventory.products.filter(product => product.quantity === 0);
            res.send(productsToRestock);
        } catch (err) {
            console.log('Error fetching products to restock:', err);
            res.status(500).send('Error fetching products to restock');
        }

});

app.get('/api/product_details/:barcode',isAuthenticated, async (req, res) => {
    try {
        const apiKey = 'jb0h522qg6qy63qsejx4w1gr0zgvo4';
        const response = await axios.get(`https://api.barcodelookup.com/v3/products?barcode=${req.params.barcode}&key=${apiKey}`);
        if (response.data.products && response.data.products.length > 0) {
            res.send({
                name: response.data.products[0].title, // Use title instead of product_name
                image: response.data.products[0].images[0]
            });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Error fetching product details');
    }
});
 

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
