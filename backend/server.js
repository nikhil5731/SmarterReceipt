const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const { User, Inventory } = require('./db');
const cors = require('cors');

mongoose.connect("mongodb+srv://kinshuokmunjal:kmunjal654@cluster0.kzwzut4.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
            console.log('User already exists:', existingUser);
            return done(null, existingUser);
        }

        const newUser = new User({
            googleId: profile.id,
            username: profile.emails[0].value,
            OwnerFirstName: profile.name.givenName,
            OwnerLastName: profile.name.familyName,
            password: undefined,
            InventoryId: undefined
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

app.get('/api/current_user', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('User is authenticated:', req.user);
        res.send(req.user);
    } else {
        console.log('User is not authenticated');
        res.send(null);
    }
});

app.post('/api/addShopName', async (req, res) => {
    const { shopName } = req.body;
    if (req.isAuthenticated()) {
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
    } else {
        res.status(401).send('User not authenticated');
    }
});

app.get('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) { console.log('Logout error:', err); }
        console.log('User logged out');
        res.redirect('/');
    });
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
