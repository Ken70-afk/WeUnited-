require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Stripe = require('stripe');

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Missing STRIPE_SECRET_KEY in environment variables.");
  console.error("Please obtain your Secret Key from the Stripe Dashboard and add it to server/.env");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

async function createProducts() {
  try {
    console.log("Creating Stripe Products and Prices...");

    // Basic Membership (Adapted from Blueprint "Example Product")
    const basicProduct = await stripe.products.create({
      name: "Basic Membership",
      description: "1 month of access to WeUnited features, including up to 50 verified phone numbers.",
      default_price_data: {
        currency: "cad",
        unit_amount: 2900 // $29.00 CAD
      }
    });

    console.log(`✅ Basic Membership Product Created!`);
    console.log(`   Product ID: ${basicProduct.id}`);
    console.log(`   Price ID:   ${basicProduct.default_price}`);
    console.log("");

    // Premium Membership
    const premiumProduct = await stripe.products.create({
      name: "Premium Membership",
      description: "2 months of full access, 150 verified phone numbers, priority placement, and relationship advisor.",
      default_price_data: {
        currency: "cad",
        unit_amount: 4900 // $49.00 CAD
      }
    });

    console.log(`✅ Premium Membership Product Created!`);
    console.log(`   Product ID: ${premiumProduct.id}`);
    console.log(`   Price ID:   ${premiumProduct.default_price}`);
    console.log("");
    
    console.log("Next Steps:");
    console.log("1. Add these PRICE_IDs to your server/.env file:");
    console.log(`   STRIPE_BASIC_PRICE_ID=${basicProduct.default_price}`);
    console.log(`   STRIPE_PREMIUM_PRICE_ID=${premiumProduct.default_price}`);
    console.log("2. Use these IDs when creating checkout sessions.");

  } catch (error) {
    console.error("Error creating products:", error.message);
  }
}

createProducts();
