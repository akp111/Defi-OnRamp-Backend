const userRoutes = require("./User")
const stripeRoute = require("./Stripe")
function initialiseRoutes(app){

    app.use("/user", userRoutes)
    app.use("/stripe", stripeRoute)
}
exports.default = initialiseRoutes;