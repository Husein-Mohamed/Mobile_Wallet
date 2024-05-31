
import express from "express";
import { deleteUser, getAllUsers, GetUserByID, setupPin, signin, signup, updateUserProfile } from "../controllers/user.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import { requireAdminRole } from "../middlewares/requireAdminRole.js";

const userRouter = express.Router();

// Simplify the route paths
userRouter.get('/',authenticateToken,  getAllUsers);

userRouter.post('/signup', signup);

userRouter.post('/signin', signin);

// Route for setting up the PIN, protected by the authenticateToken middleware
userRouter.post('/setup-pin',authenticateToken, setupPin);


userRouter.get('/user/:id', GetUserByID )

userRouter.put('/profile', authenticateToken, updateUserProfile);

// Route for deleting a user account, protected by authentication middleware
userRouter.delete('/profile', authenticateToken, deleteUser);

export default userRouter;
