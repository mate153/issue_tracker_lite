const bcrypt = require("bcrypt");
const { connect } = require('../Database/connect/dbConnect');
const logger = require("../Utils/logger");

// Registration
exports.registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) throw new Error("All fields are required.");

  const client = await connect();
  const existing = await client.query("SELECT * FROM users WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    client.release();
    throw new Error("Email is already registered.");
  }

  const hashed = await bcrypt.hash(password, 10);
  await client.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name, email, hashed]);

  client.release();
  logger.info(`[REGISTER] New user registered: ${email}`);
  return "User registered successfully";
};

// Login
exports.loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const client = await connect();
  try {
    const result = await client.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password.");
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    logger.info(`[LOGIN] User logged in: ${email}`);

    return {
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email
      }
    };
  } finally {
    client.release();
  }
};
