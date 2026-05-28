const { supabase } = require('./database');

async function test() {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: 1, // assuming user 1 exists
      invoice_number: 'TEST-DB-' + Date.now(),
      total_amount: 10000,
      shipping_address: 'Test',
      payment_token: 'test-token'
    })
    .select();
    
  if (error) console.error("DB ERROR:", error);
  else console.log("SUCCESS");
}
test();
