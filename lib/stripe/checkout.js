const {createHmac}=require('node:crypto');
const {minorUnits,readToken,receiptToken,PaymentError}=require('./config');
function checkoutParams(order,token,config){const metadata={once_order_id:order.id,once_kind:'support',terms_version:config.termsVersion};return {
 mode:'payment',currency:'gbp',integration_identifier:config.integrationIdentifier,adaptive_pricing:{enabled:false},
 ...(config.paymentMethodConfiguration?{payment_method_configuration:config.paymentMethodConfiguration}:{}),
 client_reference_id:order.id,metadata,payment_intent_data:{metadata},
 line_items:[{price_data:{currency:'gbp',unit_amount:order.amount,product_data:{name:'Support ONCE’s creative work',description:'Voluntary support for Alex Kennedy’s creative work. No card, access, ownership or financial return is purchased.'}},quantity:1}],
 automatic_tax:{enabled:false},invoice_creation:{enabled:false},
 success_url:`${config.origin}/support-received?reference=${encodeURIComponent(token)}`,
 cancel_url:`${config.origin}/connected#support`,
 custom_text:{submit:{message:'Your contribution supports Alex Kennedy trading as ONCE Collective. No goods, membership or financial return are purchased.'}},
 };}
async function createCheckout(body,ip,{stripe,store,config}){
 if(!body||Array.isArray(body)||body.accepted!==true||body.termsVersion!==config.termsVersion||body.website)throw new PaymentError(400,'Please confirm the support terms');
 const intent=readToken(body.intent,config.tokenSecret,'intent');const amount=minorUnits(body.amount);
 const key=createHmac('sha256',config.tokenSecret).update(ip||'unknown').digest('hex');
 if(!await store.rateLimit(key))throw new PaymentError(429,'Please wait a minute before trying again');
 const order=await store.ensureOrder(intent.id,amount,config.termsVersion,intent.created);
 if(order.amount!==amount||order.terms_version!==config.termsVersion)throw new PaymentError(409,'This payment reference belongs to a different amount. Start a new contribution.');
 const token=receiptToken(order.id,intent.created,config),receiptUrl=`${config.origin}/support-received?reference=${encodeURIComponent(token)}`;
 if(order.status==='paid')return {url:receiptUrl};
 if(order.session_id){const session=await stripe.checkout.sessions.retrieve(order.session_id);if(session.livemode!==config.live)throw Error('Stripe mode mismatch');if(session.status==='complete')return {url:receiptUrl};if(session.status!=='open')throw new PaymentError(409,'This checkout has expired. Start a new contribution.');return {url:session.url};}
 const session=await stripe.checkout.sessions.create(checkoutParams(order,token,config),{idempotencyKey:`once:support:${order.id}`});
 if(session.livemode!==config.live||!session.url?.startsWith('https://checkout.stripe.com/'))throw Error('Unexpected Stripe response');
 await store.bindSession(order.id,session);return {url:session.url};
}
module.exports={checkoutParams,createCheckout};
