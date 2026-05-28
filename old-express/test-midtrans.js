require('dotenv').config();
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

async function test() {
  try {
    const transaction = await snap.createTransaction({
      transaction_details: { order_id: 'TEST-PROD-' + Date.now(), gross_amount: 10000 }
    });
    console.log("SUCCESS:", transaction.token);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
