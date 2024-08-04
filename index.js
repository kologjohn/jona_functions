const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({ origin: true });
const admin=require('firebase-admin');
admin.initializeApp();
exports.paystack=functions.https.onCall(async(datam,context)=>{
  try{
 if(!context.auth)
 {
   throw new functions.https.HttpsError('unauthenticated','Not authenticated')
 }
  const tid=datam.tid;
   const email=context.auth.token.email;
   
   //const email="info@gmmail.com";
   const amount=datam.amount;
   let intValue = Math.floor(amount)
   console.log("at: "+intValue);
   const authToken="sk_live_adf99a615f097ec8d09c24925f975698922ceeb7";
   const postdata={
     "amount": intValue,
     "email": email,
     "reference": tid,
     "currency": "GHS",
     "paymentChannel": [
       "mobile_money",
     ]
   };
   const config= {
     headers:
     {
       'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json'  // Adjust content type based on your API requirements
     }
   };
   const sendapi=await axios.post('https://api.paystack.co/transaction/initialize',postdata,config)
   console.log(sendapi.data);
   return sendapi.data;

  }catch(e){
console.log(e)
return e;
  }

});

exports.currency=functions.https.onCall(async(datam,context)=>{
  try{
//  if(!context.auth)
//  {
//    throw new functions.https.HttpsError('unauthenticated','Not authenticated')
//  }
   const sendapi=await axios.get('https://open.er-api.com/v6/latest/USD')
   console.log(sendapi.data);
   return sendapi.data.rates.GHS;
  }catch(e){
console.log(e)
return e;
  }

});

exports.paystackcall = functions.https.onRequest((req, res) => {
  const responsedata = req.body;
  const status = responsedata.event;
  const reference = responsedata.data.reference;
  const amount = responsedata.data.amount;
  const channel = responsedata.data.channel;
 // res.send(reference);
  var codeupdate={"code":req.body};
  var sendmoneyupdate={"status":true};
  admin.firestore().collection("userstest").doc(reference).set(codeupdate);
  admin.firestore().collection("checkout").doc(reference).update(sendmoneyupdate);
  //var records= admin.firestore().collection("sendmoney").doc(clientid).get();
   res.status(200).send('Success'+reference);
});


exports.chat = functions.https.onCall(async (data, context) => {
  // Ensure the request has the necessary authentication if required
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'Request had no authentication.');
  // }

  const text=data.text;
  const requestData = JSON.stringify({
    "contents": [
      {
        "parts": [
          {
            "text": data.text 
          }
        ]
      }
    ]
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAsjYTLt34TtJN80f4cWmB_1H0eLpB5P90',
    headers: { 
      'Content-Type': 'application/json'
    },
    data: requestData
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('internal', 'Unable to generate content', error);
  }
});
