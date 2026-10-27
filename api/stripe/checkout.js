const {runtime,originAllowed,headers,errorResponse}=require('../../lib/stripe/runtime');
const {configuration,intentToken,PaymentError}=require('../../lib/stripe/config');
const {createCheckout}=require('../../lib/stripe/checkout');
module.exports=async function handler(req,res){headers(res);
 try{
  if(req.method==='GET'){
   const config=configuration();if(!config.ready)return res.status(200).json({ready:false});
   const {store}=runtime();await store.ready();return res.status(200).json({ready:true,testMode:!config.live,intent:intentToken(config),termsVersion:config.termsVersion,sellerName:config.sellerName,sellerEmail:config.sellerEmail,sellerAddress:config.sellerAddress});
  }
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
  const deps=runtime();if(!originAllowed(req,deps.config))throw new PaymentError(403,'Invalid request origin');
  if(String(req.headers['content-type']||'').split(';')[0].trim()!=='application/json')throw new PaymentError(415,'JSON required');
  if(Number(req.headers['content-length']||0)>4096)throw new PaymentError(413,'Request too large');
  let body=req.body;try{if(Buffer.byteLength(typeof body==='string'?body:JSON.stringify(body)||'')>4096)throw new PaymentError(413,'Request too large');if(typeof body==='string')body=JSON.parse(body);}catch(e){if(e instanceof PaymentError)throw e;throw new PaymentError(400,'Invalid request');}
  const ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  return res.status(200).json(await createCheckout(body,ip,deps));
 }catch(e){return errorResponse(res,e);}
};
