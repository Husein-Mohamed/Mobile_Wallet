import jwt from 'jsonwebtoken';
import { jwtSecret } from '../../confic/confic.js';


const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  console.log('Received token:', token); 

  if (!token) {
    return res.status(401).json({status: 'false', message: 'No token provided. Authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded && decoded.id) {
      req.user = { userId: decoded.id };
      next();
    } else {
      res.status(401).json({ message: 'Unable to authenticate token.' });
    }
  } catch (err) {
    res.status(403).json({ message: 'Token is not valid.' });
  }
};

export default authenticateToken;
