import mongoose from "mongoose";

const mongoURI =
  "mongodb+srv://info:trotamundo123@cluster0.tlgy1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB without deprecated options
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Check if the User model already exists
const User = mongoose.models.User || mongoose.model("User", userSchema);

export { User };
