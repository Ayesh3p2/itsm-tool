import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        // Check both x-auth-token and Authorization headers
        const token = req.header('x-auth-token') || 
                     req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Token is not valid' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export default auth;
