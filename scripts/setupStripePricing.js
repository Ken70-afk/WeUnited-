import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the secret key manually or via dotenv (simplifying to just read .env)
const envPath = path.join(__dirname, '..', 'server', '.env');
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
VITE_STRIPE_PREMIUM_CAD=${pCAD.id}
VITE_STRIPE_PREMIUM_USD=${pUSD.id}
VITE_STRIPE_PREMIUM_AUD=${pAUD.id}
VITE_STRIPE_PREMIUM_EUR=${pEUR.id}

VITE_STRIPE_BASIC_CAD=${bCAD.id}
VITE_STRIPE_BASIC_USD=${bUSD.id}
VITE_STRIPE_BASIC_AUD=${bAUD.id}
VITE_STRIPE_BASIC_EUR=${bEUR.id}
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
