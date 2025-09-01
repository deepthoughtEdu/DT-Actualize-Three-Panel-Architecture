import bcrypt from "bcrypt";

const password = "123456"; // your raw password
bcrypt.hash(password, 10).then((hash) => {
  console.log("Hashed password:", hash);
});
