// Run manually against the dedicated payments database using secure environment configuration.
const {SQL}=require('bun');
if(!process.env.ONCE_PAYMENTS_DATABASE_URL)throw Error('ONCE_PAYMENTS_DATABASE_URL required');
const sql=new SQL(process.env.ONCE_PAYMENTS_DATABASE_URL,{max:1});
try{const schema=await Bun.file(new URL('./stripe-schema.sql',import.meta.url)).text();await sql.unsafe(schema).simple();console.info('Payments schema ready');}finally{await sql.close();}
