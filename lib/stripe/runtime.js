const {configuration,PaymentError}=require('./config');
const {runtimeStore}=require('./store');
let client;
function runtime(){const config=configuration();if(!config.ready)throw new PaymentError(503,'Direct support is being prepared. Please try again later.');
 client??=new (require('stripe'))(config.key,{maxNetworkRetries:2,timeout:15000});return {config,stripe:client,store:runtimeStore(config.databaseUrl)};}
function originAllowed(req,config){const origin=req.headers.origin;return !!origin&&[config.origin,'https://oncecollective.com','https://www.oncecollective.com'].includes(origin)&&req.headers['sec-fetch-site']!=='cross-site';}
function headers(res){res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');}
function errorResponse(res,error){const safe=error instanceof PaymentError;return res.status(safe?error.status:503).json({error:safe?error.message:'Direct support is temporarily unavailable. Please try again later.'});}
module.exports={runtime,originAllowed,headers,errorResponse};
