const {runtime,headers,errorResponse}=require('../../lib/stripe/runtime');
async function rawBody(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>262144){const e=new Error('Payload too large');e.status=413;throw e;}chunks.push(chunk);}return Buffer.concat(chunks);}
async function processEvent(event,{config,store}){
 if(event.livemode!==config.live)throw Error('Webhook mode mismatch');
 const object=event.data.object;
 if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){
  if(object.metadata?.once_kind!=='support')return;
  if(object.livemode!==config.live)throw Error('Session mode mismatch');
  if(object.payment_status==='paid')await store.recordPaid(event,object);
 }else if(event.type==='charge.refunded')await store.recordRefund(event,object);
 else if(['charge.dispute.created','charge.dispute.closed','checkout.session.async_payment_failed'].includes(event.type))await store.recordReview(event,object);
}
module.exports=async function handler(req,res){headers(res);if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 let deps;try{deps=runtime();}catch(e){return errorResponse(res,e);}
 let event;try{if(Number(req.headers['content-length']||0)>262144)return res.status(413).json({error:'Payload too large'});const raw=await rawBody(req);if(raw.length>262144)return res.status(413).json({error:'Payload too large'});event=await deps.stripe.webhooks.constructEventAsync(raw,req.headers['stripe-signature'],deps.config.webhookSecret);}catch(e){return res.status(e.status===413?413:400).json({error:'Invalid webhook'});}
 try{await processEvent(event,deps);return res.status(200).json({received:true});}catch(e){console.error(JSON.stringify({integration:'stripe',eventId:event.id,type:event.type,error:'processing_failed'}));return res.status(500).json({error:'Payment processing will be retried'});}
};
module.exports.config={api:{bodyParser:false}};
module.exports.processEvent=processEvent;
module.exports.rawBody=rawBody;
