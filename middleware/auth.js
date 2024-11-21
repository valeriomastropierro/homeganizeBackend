const jwt = require ('jsonwebtoken');
const User = require('../models/UserModel')
require('dotenv').config({ path: '../.env' });
const secret = process.env.JWT_SECRET || 'your_secret_key';

const authenticateToken = (req, res, next) => {

    console.log('authenticating token');
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'accesso negato, token mancante'});
    }

    try {
        const verified = jwt.verify(token, secret);
        req.user = verified;
        console.log('authentication success')
        next();
    } catch (error) {
        console.log('autenticazione fallita')
        res.status(400).json({message: 'token non valido'});
    }
};

module.exports = authenticateToken;