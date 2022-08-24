const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

app.get("/users/", async (request, response) => {
  const getuserQuery = `
  SELECT
    *
  FROM
    user
  `;
  const userArray = await db.all(getuserQuery);
  response.send(userArray);
});

//POST
app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username ='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const registerUser = `INSERT INTO user(username,name,password,gender,location) VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
    await db.run(registerUser);
    response.send("User Created Successfully");
  } else {
    response.status(400);
    response.send("User Already Existed");
    console.log("User Already Existed");
  }
  //   const registerUser = `INSERT INTO user(username,name,password,gender,location) VALUES('${username}','${name}','${password}','${gender}','${location}');`;
  //   await db.run(registerUser);
  //   response.send("User added");
});

//Login
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const getUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(getUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("No User");
    console.log("No User");
  } else {
    //check password
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login Successful");
      console.log("Login Successful");
    } else {
      response.status(400);
      response.send("Incorrect Password");
      console.log("Incorrect Password");
    }
  }
});
