const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const passport = require('passport');
const path = require('path');
const rootRouter = require('./routes')
const bodyParser = require('body-parser');

require('./config/passport'); // Initialize Passport configuration

const app = express();

app.use(cors());

app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


app.use(cookieSession({
    name: 'session',
    keys: ['56fb7a12f566d26973accd3014ba65e66db60ddf445a5f98f0837400aa916b34'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

// Register routes
app.use('/api/v1', rootRouter);
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
