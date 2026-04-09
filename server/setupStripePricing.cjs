const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// Read the secret key manually or via dotenv (simplifying to just read .env)
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const secretKeyMatch = envContent.match(/STRIPE_SECRET_KEY=(.*)/);

if (!secretKeyMatch) {
  console.error('Could not find STRIPE_SECRET_KEY in server/.env');
  process.exit(1);
}

const stripe = new Stripe(secretKeyMatch[1].trim());

async function setup() {
  console.log('Creating Products...');

  const premiumProduct = await stripe.products.create({
    name: 'Premium Membership (3 Months)',
    description: 'Access to unlimited Profiles, Customer Support, Enhanced Trust Badge, and Advanced Filters.',
  });

  const basicProduct = await stripe.products.create({
    name: 'Basic Membership (2 Months)',
    description: 'Access to limited Profiles, Customer Support, and Advanced Filters.',
  });

  console.log('Products created:', premiumProduct.id, basicProduct.id);

  console.log('Creating Prices...');

  // PREMIUM PRICES
  const pCAD = await stripe.prices.create({ product: premiumProduct.id, unit_amount: 9900, currency: 'cad' });
  const pUSD = await stripe.prices.create({ product: premiumProduct.id, unit_amount: 7500, currency: 'usd' });
  const pAUD = await stripe.prices.create({ product: premiumProduct.id, unit_amount: 9900, currency: 'aud' });
  const pEUR = await stripe.prices.create({ product: premiumProduct.id, unit_amount: 5900, currency: 'eur' });

  // BASIC PRICES
  const bCAD = await stripe.prices.create({ product: basicProduct.id, unit_amount: 7900, currency: 'cad' });
  const bUSD = await stripe.prices.create({ product: basicProduct.id, unit_amount: 3900, currency: 'usd' });
  const bAUD = await stripe.prices.create({ product: basicProduct.id, unit_amount: 4900, currency: 'aud' });
  const bEUR = await stripe.prices.create({ product: basicProduct.id, unit_amount: 2900, currency: 'eur' });

  console.log('Prices successfully created!');
  
  const envUpdates = `
VITE_STRIPE_PREMIUM_CA=${pCAD.id}
VITE_STRIPE_PREMIUM_US=${pUSD.id}
VITE_STRIPE_PREMIUM_AU=${pAUD.id}
VITE_STRIPE_PREMIUM_EU=${pEUR.id}

VITE_STRIPE_BASIC_CA=${bCAD.id}
VITE_STRIPE_BASIC_US=${bUSD.id}
VITE_STRIPE_BASIC_AU=${bAUD.id}
VITE_STRIPE_BASIC_EU=${bEUR.id}
`;

  console.log('Add the following to your .env.local:');
  console.log(envUpdates);

  // Write to .env.local automatically
  const localEnvPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(localEnvPath)) {
    fs.appendFileSync(localEnvPath, '\n# Regional Pricing\n' + envUpdates);
    console.log('.env.local updated successfully.');
  }
}

setup().catch(console.error);
