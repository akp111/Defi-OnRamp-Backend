const User = require("../models/User");
const { createUser } = require("./Stripe");
const ethers = require("ethers");
//Store User To Mongo
exports.registerUserToMongo = async (email, address, stripe_id) => {
  return new Promise((resolve, reject) => {
    try {
      const newuser = new User({
        email,
        address,
        stripe_id,
      });

      newuser.save().then((err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    } catch (error) {
      console.log("User.js | Error while storing user to mongo");
      console.error(error);
      const resError = new Error("Error while creating user");
      reject(resError);
    }
  });
};

// Regsiter user
exports.registerUser = async (req, res, next) => {
  const { email, address } = req.body;
  try {
    if (email && address) {
      const stripeResponse = await createUser(email, address);
      console.log("User.js | Stripe Response");
      console.log(stripeResponse);
      const mongoResponse = await this.registerUserToMongo(
        email,
        address,
        stripeResponse
      );
      console.log("User.js | Mongo response");
      console.log(mongoResponse);
      res.sendStatus(201).json("User created successfully!");
    }
  } catch (error) {
    console.log("User.js | Error while registring user to mongo");
    console.error(error);
    res.sendStatus(500);
  }
};

//Find User
exports.findUser = async (email, address) => {
  return new Promise((resolve, reject) => {
    try {
      const user = User.findOne({
        email,
        address,
      });
      !user && reject("Error while finding");
      resolve(user);
    } catch (error) {
      console.log("User.js | Error while finding user from mongo");
      console.error(error);
      const resError = new Error("Error while creating error");
      reject(resError);
    }
  });
};

//Login User
exports.loginUser = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, address, signature } = req.body;
    const message = JSON.stringify({ email: email, address: address });
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      const user = await this.findUser(email, address);
      if(user)
        res.sendStatus(200);
      else
        res.sendStatus(403)
    }
  } catch (error) {
    console.log("User.js | Error while finding user from mongo");
    console.error(error);
    const resError = new Error("Error while creating error");
    throw resError;
  }
};
