const stripe = require('stripe')(process.env.STRIPE_API_KEY || '');
 
export async function getBalance() {
  console.log(process.env.STRIPE_API_KEY);
  const balance = await stripe.balance.retrieve();
  console.log(balance);
}


