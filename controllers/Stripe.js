require("dotenv").config();
const router = require("express").Router();
const stripe = require("stripe")(
  process.env.STRIPE_PK
);
const { findUser } = require("./User");
const ethers = require("ethers");
const uuid = require("uuid").v4;
const contractAbi = require("./abi.js").default;
const DOLLAR_TO_MATIC = 0.001;

exports.createUser = function (email, name) {
  return new Promise((resolve, reject) => {
    try {
      stripe.customers.create(
        {
          name: name,
          email: email,
        },
        (stripeErr, stripeRes) => {
          if (stripeErr) {
            console.log(
              "Stripe.js | Mayday!! Error while creating stripe user"
            );
            console.log(stripeErr);
            const error = new Error(stripeErr);
            reject(error);
          } else {
            console.log("Stripe.js | Stripe User created successfully");
            console.log(stripeRes);
            resolve(stripeRes.id);
          }
        }
      );
    } catch (error) {
      console.log("Stripe.js | Error while creating user in stripe");
      console.error(error);
    }
  });
};
exports.createCharges = (amount, customerId) => {
  console.log(customerId);
  const idempotencyKey = uuid();
  return new Promise((resolve, reject) => {
    try {
      stripe.charges.create(
        {
          amount: amount,
          currency: "usd",
          customer: customerId,
        },
        {
          idempotencyKey,
        },
        (stripeErr, stripeRes) => {
          if (stripeErr) {
            reject(stripeErr);
          } else {
            resolve(stripeRes);
          }
        }
      );
    } catch (error) {
      console.log("Stripe.js | Error while creating payment in stripe");
      console.error(error);
      reject(error);
    }
  });
};

exports.createPayment = async (req, res, next) => {
  try {
    console.log(req.body);
    // const customer = await this.createUser(req.name, req.email, req.source);
    const charges = await this.createPaymentIntent(req.body.amount);
    res.status(200).json(charges);
  } catch (error) {
    console.log("Stripe.js | Error while creating payment in stripe");
    console.error(error);
    res.status(500).json(error);
  }
};

exports.createPaymentIntent = async (amount) => {
  return new Promise(async (resolve, reject) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        description: "Software development services",
        shipping: {
          name: "Jenny Rosen",
          address: {
            line1: "510 Townsend St",
            postal_code: "98140",
            city: "San Francisco",
            state: "CA",
            country: "US",
          },
        },
        payment_method_types: ["card"],
      });
      console.log(paymentIntent);
      resolve(paymentIntent);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
// exports.lendToAave = async (amount, user, expiry, signature) => {
//   console.log("Calling lendToAave")
//   return new Promise(async (resolve, reject) => {
//     try {
//       console.log(process.env.RPC_URL)
//       console.log(process.env.PRIVATE_KEY)
//       const maticAmount = (parseInt(amount) / 100) * DOLLAR_TO_MATIC;
//       const privateKey = process.env.PRIVATE_KEY;
//       const contractAddress = "0x696637EbadF8557477DEc17132e8f645B28C7902";
//       const provider = new ethers.providers.JsonRpcProvider(
//         process.env.RPC_URL
//       );
//       const wallet = new ethers.Wallet(privateKey, provider);
//       const newContract = new ethers.Contract(
//         contractAddress,
//         contractAbi,
//         provider
//       );
//       const signingContract = newContract.connect(wallet);
//       const { r, s, v } = ethers.utils.splitSignature(signature);
//       console.log("trxPromise")
//       const trxPromise = signingContract.lendToAave(
//         v.toString(),
//         r.toString(),
//         s.toString(),
//         user.toString(),
//         expiry.toString(),
//         { value: ethers.utils.parseEther(maticAmount.toString()) }
//       );
//       await trxPromise
//         .then(async function (tx) {
//           console.info("Transaction sent: %o", tx);
//           await tx.wait(3);
//           resolve(tx);
//         })
//         .catch((err) => {
//           console.error("Unable to complete transaction, error: %o", err);

//           reject(`Unable to complete transaction, error: ${err}`);
//         });
//     } catch (error) {
//       reject(`Something went wrong!!`);
//     }
//   });
// };
exports.createTransaction = async (req, res, next) => {
  console.log("Calling createTransaction with body %o", req.body)
  try {
    const maticAmount = (parseInt(req.body.amount) / 100) * DOLLAR_TO_MATIC;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = "0x5e7fE8E7243925B4e239fc0B93617Fe4903cA2f8";
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_URL
    );
    const wallet = new ethers.Wallet(privateKey, provider);
    const newContract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );
    const signingContract = newContract.connect(wallet);
    const { r, s, v } = ethers.utils.splitSignature(req.body.signature);
    const trxPromise = signingContract.lendToAave(
      v.toString(),
      r.toString(),
      s.toString(),
      req.body.user.toString(),
      req.body.expiry.toString(),
      { value: ethers.utils.parseEther(maticAmount.toString()) }
    );
    await trxPromise
      .then(async function (tx) {
        console.info("Transaction sent: %o", tx);
        await tx.wait(3);
        // resolve(tx);
        res.status(200).json()
      })
      .catch((err) => {
        console.error("Unable to complete transaction, error: %o", err);
        res.status(403).json()
        // reject(`Unable to complete transaction, error: ${err}`);
      });
  } catch (error) {
    console.log(error)
    res.status(403).json()
  }
};


