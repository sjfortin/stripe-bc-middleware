require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");

const app = express();

// Stripe requires the raw body to construct the event.
app.use(bodyParser.raw({ type: "application/json" }));

app.get("/", (req, res) => {
  res.send("Webhook party time!");
});

app.post("/webhook", (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    fs.appendFileSync("log.txt", `Webhook Error: ${err.message}\n`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      fs.appendFileSync(
        "log.txt",
        `PaymentIntent was successful: ${JSON.stringify(paymentIntent)}\n`
      );
      console.log(`PaymentIntent was successful!`);
      break;
    default:
      fs.appendFileSync("log.txt", `Unhandled event type ${event.type}.\n`);
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});
