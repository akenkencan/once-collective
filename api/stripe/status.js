const {runtime,headers,errorResponse}=require('../../lib/stripe/runtime');
const {readToken}=require('../../lib/stripe/config');
module.exports=async function handler(req,res){headers(res);if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}try{
 const {config,store}=runtime(),reference=new URL(req.url,config.origin).searchParams.get('reference');
 const token=readToken(reference,config.tokenSecret,'receipt'),order=await store.getOrder(token.id);
 if(!order)return res.status(404).json({error:'Contribution not found'});
 return res.status(200).json({status:order.status==='paid'?'paid':'pending',refundedAmount:order.refunded_amount||0,testMode:!config.live});
 }catch(e){return errorResponse(res,e);}
};
