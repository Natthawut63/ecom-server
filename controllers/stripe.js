const prisma = require("../config/prisma");
const stripe = require("stripe")(
  "sk_test_51QSt2aDuyDZC8hUPsTLNtpN7SL0dnG2LDSlyXHcC4b0zHwOjLcZXVNVVFr17gKY1o89gC1HCGbHdJ0jDzDIq7ecM00fTzKx7f9"
);

exports.payment = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id
  }})
  const amountTHB = cart.cartTotal*100

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "paymentIntent Error" });
  }
};
