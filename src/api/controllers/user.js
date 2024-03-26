import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
 // Adjust the path as needed

// Signup controller
export const signup = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send("Error creating the user");
  }
};

// Signin controller
export const signin = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ userId: user._id }, "your_secret_key", { expiresIn: '24h' });
      res.status(200).send({ token });
    } else {
      res.status(401).send("Username or password is incorrect");
    }
  } catch (error) {
    res.status(500).send("Error during the sign in process");
  }
};
