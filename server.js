require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const initialiseRoutes = require("./routes/index").default

//middleware
app.use(express.json());
app.use(cors());
initialiseRoutes(app);
//mongoose connect
mongoose
  .connect(
    process.env.MONGO_URL
  )
  .then(() => {
    console.log("Successfully connected to Mongo");
  })
  .catch((err) => {
    console.log(err);
    console.log("Mayday!! Mongo connection failed");
  });

// servers starts listening
app.listen(4000, () => {
  console.log("Server started at 4000");
});
