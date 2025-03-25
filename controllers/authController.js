import asyncHandler from "express-async-handler";
import User from "../models/user.js";

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }
  console.log("email", email);
  console.log("password", password);

  // Find user by email
  const user = await User.findOne({ customer_email: email }).select("password customer_name customer_id");
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  console.log("user", user
  );

  // Compare provided password with the stored password
  if (password !== user.password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Login successful
  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.customer_id,
      name: user.customer_name,
      email: email,
    },
  });
});

export { loginUser };