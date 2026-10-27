const {createHmac,randomUUID,timingSafeEqual}=require('node:crypto');
const TERMS_VERSION='support-2026-10-26';
class PaymentError extends Error {constructor(status,message){super(message);this.status=status;}}
function configuration(env=process.env){
 const live=env.ONCE_STRIPE_MODE==='live';
 const ready=env.ONCE_STRIPE_ENABLED==='true'&&!!env.STRIPE_SECRET_KEY&&!!env.STRIPE_WEBHOOK_SECRET&&!!env.ONCE_PAYMENTS_DATABASE_URL&&!!env.ONCE_PAYMENTS_TOKEN_SECRET;
 if(!ready)return {ready:false};
 const origin=new URL(env.ONCE_PAYMENTS_ORIGIN||'https://www.oncecollective.com');
 if(origin.protocol!=='https:'||origin.origin!==origin.href.replace(/\/$/,''))throw new Error('Invalid payment origin');
 if(!['https://oncecollective.com','https://www.oncecollective.com'].includes(origin.origin)&&!origin.hostname.endsWith('.vercel.app'))throw new Error('Invalid payment origin');
 if(!/^(sk|rk)_(test|live)_/.test(env.STRIPE_SECRET_KEY)||env.STRIPE_SECRET_KEY.includes(live?'_test_':'_live_'))throw new Error('Stripe mode mismatch');
 if(env.ONCE_PAYMENTS_TOKEN_SECRET.length<32)throw new Error('Token signing secret too short');
 if(live&&(env.ONCE_STRIPE_LIVE_APPROVED!=='true'||!env.ONCE_SELLER_ADDRESS||!env.ONCE_SELLER_EMAIL))throw new Error('Live seller details and review required');
 const integrationIdentifier=env.ONCE_STRIPE_INTEGRATION_IDENTIFIER;
 if(!/^once_support_[a-z]{8}$/.test(integrationIdentifier||''))throw new Error('Stable integration identifier required');
 return {ready:true,live,origin:origin.origin,key:env.STRIPE_SECRET_KEY,webhookSecret:env.STRIPE_WEBHOOK_SECRET,databaseUrl:env.ONCE_PAYMENTS_DATABASE_URL,
 tokenSecret:env.ONCE_PAYMENTS_TOKEN_SECRET,integrationIdentifier,paymentMethodConfiguration:env.ONCE_STRIPE_PAYMENT_METHOD_CONFIGURATION,
 sellerName:'Alex Kennedy trading as ONCE Collective',sellerEmail:env.ONCE_SELLER_EMAIL||'',sellerAddress:env.ONCE_SELLER_ADDRESS||'',termsVersion:TERMS_VERSION};
}
function signToken(data,secret){const payload=Buffer.from(JSON.stringify(data)).toString('base64url');return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');}
function readToken(token,secret,purpose,now=Date.now()){
 if(typeof token!=='string'||token.length>1024)throw new PaymentError(400,'Invalid payment reference');
 const [payload,signature,extra]=token.split('.');
 const expected=createHmac('sha256',secret).update(payload||'').digest();let actual;
 try{actual=Buffer.from(signature||'','base64url')}catch{throw new PaymentError(400,'Invalid payment reference')}
 if(extra||actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new PaymentError(400,'Invalid payment reference');
 let data;try{data=JSON.parse(Buffer.from(payload,'base64url'))}catch{throw new PaymentError(400,'Invalid payment reference')}
 if(data.purpose!==purpose||!Number.isSafeInteger(data.exp)||data.exp<now||!Number.isSafeInteger(data.created)||data.created>now+60000||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(data.id||''))throw new PaymentError(400,'Payment reference expired or invalid');
 return data;
}
function intentToken(config,now=Date.now()){return signToken({id:randomUUID(),purpose:'intent',created:now,exp:now+3600000},config.tokenSecret)}
function receiptToken(id,created,config){return signToken({id,purpose:'receipt',created,exp:created+30*86400000},config.tokenSecret)}
function minorUnits(value){if(typeof value!=='string'||!/^(0|[1-9]\d{0,3})(\.\d{1,2})?$/.test(value))throw new PaymentError(400,'Enter an amount between £1 and £5,000');const [whole,fraction='']=value.split('.');const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(n<100||n>500000)throw new PaymentError(400,'Enter an amount between £1 and £5,000');return n;}
module.exports={configuration,PaymentError,TERMS_VERSION,signToken,readToken,intentToken,receiptToken,minorUnits};
