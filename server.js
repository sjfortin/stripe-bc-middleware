const fastify = require('fastify')({ logger: true });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

fastify.register(require('fastify-formbody')); // to handle incoming form data

fastify.post('/webhook', async (request, reply) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      request.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // On error, log and return the error message
    console.log(`Error message: ${err.message}`);
    return reply.code(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent was successful!`);
      // Here, you can call a function to transfer funds or do something else
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a response to acknowledge receipt of the event
  reply.code(200).send({ received: true });
});

fastify.listen(3000, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
