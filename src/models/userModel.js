import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // Ensures usernames are unique in the database
  },
  password: {
    type: String,
    required: true
  }
  // Add additional fields as needed
});

// Create the model from the schema
const User = mongoose.model('User', userSchema);

export default User;
