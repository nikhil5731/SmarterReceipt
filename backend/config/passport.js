const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../db');
const { generateUniqueInventoryId } = require('../helpers');

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
    callbackURL: 'https://smarterreceipt.onrender.com/api/v1/auth/google/callback' // Ensure the callback URL matches
}, async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            if (!user.InventoryId) {
                user.InventoryId = await generateUniqueInventoryId();
                await user.save();
            }
            return done(null, user);
        }

        const newUser = new User({
            googleId: profile.id,
            username: profile.emails[0].value,
            OwnerFirstName: profile.name.givenName,
            OwnerLastName: profile.name.familyName,
            password: undefined,
        });

        await newUser.save();
        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}));
