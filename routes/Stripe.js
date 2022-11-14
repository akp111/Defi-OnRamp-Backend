const router = require("express").Router();
const stripeController = require("../controllers/Stripe");
router.post("/payment", stripeController.createPayment);
router.post("/payment-intent", stripeController.createPaymentIntent)
router.post("/lend-to-aave", stripeController.createTransaction);
module.exports = router;
