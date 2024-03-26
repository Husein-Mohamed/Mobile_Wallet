// Import Router from the express module
import { Router } from "express";
import { signin, signup } from "../controllers/user.js";

// Create a new router instance
const userRouter = Router();

// Define a GET route on the root of the userRouter
userRouter.get('/', (req, res) => {
  // Send a response when this route is accessed
  res.send('Welcome to the User Page');
});
userRouter.post('/signup', signup);
userRouter.post('/signin', signin);

// Export the router for use in other parts of the application
export default userRouter;
