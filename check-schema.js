const { supabase } = require('./database');

async function check() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.log("DB ERROR:", error);
  } else {
    if (data.length > 0) {
      console.log("COLUMNS:", Object.keys(data[0]));
    } else {
      console.log("No data, inserting dummy to test schema");
      // Actually, we can just select a non-existent row and try to get the shape, 
      // but if there's no data, let's just do a deliberate insert failure to see the error.
      const { error: insErr } = await supabase.from('orders').insert({ payment_token: 'test' }).select();
      console.log("INSERT ERROR:", insErr);
    }
  }
}
check();
