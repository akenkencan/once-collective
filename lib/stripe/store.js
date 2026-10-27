// Dedicated durable PostgreSQL database. Vercel runs this project on Bun.
function createStore(sql){return {
 async ready(){await sql`SELECT id FROM once_payment_orders LIMIT 0`;},
 async rateLimit(key){const rows=await sql`INSERT INTO once_payment_limits(key,minute,count) VALUES(${key},date_trunc('minute',now()),1) ON CONFLICT(key) DO UPDATE SET minute=date_trunc('minute',now()),count=CASE WHEN once_payment_limits.minute=date_trunc('minute',now()) THEN once_payment_limits.count+1 ELSE 1 END RETURNING count`;return rows[0].count<=10;},
 async ensureOrder(id,amount,termsVersion,created){return sql.begin(async tx=>{await tx`INSERT INTO once_payment_orders(id,amount,terms_version,intent_created_at) VALUES(${id},${amount},${termsVersion},${created}) ON CONFLICT DO NOTHING`;return (await tx`SELECT * FROM once_payment_orders WHERE id=${id} FOR UPDATE`)[0]});},
 async getOrder(id){return (await sql`SELECT * FROM once_payment_orders WHERE id=${id}`)[0];},
 async bindSession(id,session){const rows=await sql`UPDATE once_payment_orders SET session_id=${session.id} WHERE id=${id} AND (session_id IS NULL OR session_id=${session.id}) RETURNING id`;if(rows.length!==1)throw Error('Session conflict');},
 async recordPaid(event,session){return sql.begin(async tx=>{
  const claim=await tx`INSERT INTO once_payment_events(id,type) VALUES(${event.id},${event.type}) ON CONFLICT DO NOTHING RETURNING id`;if(!claim.length)return;
  const paymentIntent=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id;
  if(!paymentIntent)throw Error('Missing payment intent');
  await tx`SELECT pg_advisory_xact_lock(hashtext(${paymentIntent}))`;
  const order=(await tx`SELECT * FROM once_payment_orders WHERE id=${session.client_reference_id} FOR UPDATE`)[0];
  if(!order||order.amount!==session.amount_total||order.terms_version!==session.metadata?.terms_version||session.metadata?.once_order_id!==order.id||session.currency!=='gbp'||session.mode!=='payment'||session.metadata?.once_kind!=='support'||!session.payment_intent||(order.session_id&&order.session_id!==session.id))throw Error('Payment reconciliation mismatch');
  if(order.status==='paid')return;
  await tx`UPDATE once_payment_orders SET status='paid',session_id=${session.id},payment_intent_id=${typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent.id},paid_at=now() WHERE id=${order.id}`;
  await tx`UPDATE once_payment_orders SET refunded_amount=COALESCE((SELECT amount FROM once_payment_refunds WHERE payment_intent_id=${paymentIntent}),0) WHERE id=${order.id}`;
  await tx`INSERT INTO once_payment_outbox(id,order_id,kind) VALUES(${`ack:${order.id}`},${order.id},'personal_acknowledgment') ON CONFLICT DO NOTHING`;
 });},
 async recordRefund(event,charge){return sql.begin(async tx=>{const claim=await tx`INSERT INTO once_payment_events(id,type) VALUES(${event.id},${event.type}) ON CONFLICT DO NOTHING RETURNING id`;if(!claim.length)return;const id=typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id;if(!id)return;await tx`SELECT pg_advisory_xact_lock(hashtext(${id}))`;await tx`INSERT INTO once_payment_refunds(payment_intent_id,amount) VALUES(${id},${charge.amount_refunded}) ON CONFLICT(payment_intent_id) DO UPDATE SET amount=GREATEST(once_payment_refunds.amount,EXCLUDED.amount)`;await tx`UPDATE once_payment_orders SET refunded_amount=GREATEST(refunded_amount,${charge.amount_refunded}) WHERE payment_intent_id=${id}`;});},
 async recordReview(event,object){return sql.begin(async tx=>{const claim=await tx`INSERT INTO once_payment_events(id,type) VALUES(${event.id},${event.type}) ON CONFLICT DO NOTHING RETURNING id`;if(!claim.length)return;const ref=typeof object.payment_intent==='string'?object.payment_intent:object.payment_intent?.id;const id=`review:${event.id}`;await tx`INSERT INTO once_payment_outbox(id,kind,stripe_object_id) VALUES(${id},'payment_review',${ref||object.id}) ON CONFLICT DO NOTHING`;});},
};}
let cached;
function runtimeStore(databaseUrl){if(!cached){const {SQL}=require('bun');cached=createStore(new SQL(databaseUrl,{max:2,idleTimeout:20,connectionTimeout:10}));}return cached;}
module.exports={createStore,runtimeStore};
