require('dotenv').config({ path: require('path').resolve(__dirname, '.env') }); // Load local .env
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Instructions: Add your Firebase service account JSON to server/serviceAccountKey.json
// or set GOOGLE_APPLICATION_CREDENTIALS environment variable.
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
} catch (error) {
  console.warn("Firebase Admin SDK failed to initialize. Make sure GOOGLE_APPLICATION_CREDENTIALS is set.", error.message);
}

const db = admin.apps.length ? admin.firestore() : null;

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Missing STRIPE_SECRET_KEY. Get it from Stripe Dashboard.");
}
const stripe = new Stripe(stripeSecretKey);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = express();

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook/handle-checkout-completed') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors({ origin: 'http://localhost:5173' })); // Adjust based on frontend URL

/**
 * Domain Action: create_checkout_session
 * Blueprint Request: POST /v1/checkout/sessions
 */
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, planType } = req.body;
    
    console.log("Incoming checkout request:", req.body);

    if (!priceId || !userId) {
      return res.status(400).json({ error: "Missing priceId or userId" });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      // The client_reference_id helps us link the Stripe payment back to the Firebase User
      client_reference_id: userId,
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/membership`,
      metadata: {
        plan: planType || 'premium',
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message, "| Stripe Error Type:", error.type, "| Raw error:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.message });
  }
});

/**
 * Domain Action: retrieve_checkout_session
 * Fetch session details for the success page
 */
app.get('/checkout-session', async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent.latest_charge']
    });
    res.json(session);
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Domain Action: handle_checkout_completed
 * Blueprint Request: Webhook listening for checkout.session.completed
 */
app.post('/webhook/handle-checkout-completed', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object;
    
    const userId = checkoutSession.client_reference_id;
    const customerId = checkoutSession.customer; // The Stripe customer ID
    const purchasedPlan = checkoutSession.metadata?.plan || 'premium';
    
    console.log(`Checkout session completed for user ${userId}. Customer ID: ${customerId}, Plan: ${purchasedPlan}`);
    
    if (userId && db) {
      try {
        // Persist the Stripe resource identifiers to the datastore
        const userRef = db.collection('profiles').doc(userId);
        await userRef.update({
          plan: purchasedPlan,
          isPremium: purchasedPlan === 'premium',
          isBasic: purchasedPlan === 'basic',
          stripeCustomerId: customerId,
          lastPaymentStatus: 'success',
          lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Successfully updated Firebase for user ${userId}`);
      } catch (err) {
        console.error(`Error updating Firebase for user ${userId}:`, err);
      }
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

// Start local server if not running in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 4242;
  app.listen(PORT, () => console.log(`Node Express server running on port ${PORT}...`));
}

// Export for Vercel
module.exports = app;
