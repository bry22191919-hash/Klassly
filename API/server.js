const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./tables");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/register", (req, res) => {
  const  {name, email, password, role} = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  if (!name ||!email || !password ||!role ){
    return res.status(400).send('Fill out all requirements');
  }

  const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, email, hashed, role], function(err) {
    if(err) return res.status(400).json({error: "email already exists"});
    console.log("Registered successfully");
    res.json({
      message: "User successfully registered",
      user_id: this.lastId
    });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Wrong password" });
    }

    res.json({ message: "Login success", user });
  });
});




app.listen(3001, () => console.log("Running on http://localhost:3001"));
