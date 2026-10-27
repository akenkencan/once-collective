(async()=>{
 const heading=document.getElementById('receipt-heading'),status=document.getElementById('receipt-status');if(!heading||!status)return;
 const reference=new URLSearchParams(location.search).get('reference');
 // Receipt token is a capability. Remove it from the address bar and retain only this tab's session.
 if(reference){sessionStorage.setItem('onceSupportReceipt',reference);history.replaceState(null,'',location.pathname);}
 const token=reference||sessionStorage.getItem('onceSupportReceipt');if(!token){heading.textContent='Your contribution';status.textContent='Use the confirmation link returned by checkout to check this contribution.';return;}
 for(let attempt=0;attempt<12;attempt++){
  try{const response=await fetch('/api/stripe/status?reference='+encodeURIComponent(token),{cache:'no-store'});const result=await response.json();if(!response.ok)throw Error();
   if(result.status==='paid'){heading.textContent=result.testMode?'Sandbox payment confirmed':'Your contribution has been received';status.textContent=result.refundedAmount>0?'A refund has been recorded for this contribution. Check your payment receipt for details.':result.testMode?'The test payment has been verified. No real contribution was taken.':'Thank you for supporting the work. Your payment has been verified.';return;}
  }catch{heading.textContent='We couldn’t check the payment yet';status.textContent='Please check your Stripe payment receipt or contact Alex before trying again. Do not make a second payment just because this page is still waiting.';return;}
  if(attempt<11)await new Promise(resolve=>setTimeout(resolve,2500));
 }
 heading.textContent='Confirmation is still pending';status.textContent='Your payment may still be processing. Check your receipt or contact Alex before trying again.';
})();
