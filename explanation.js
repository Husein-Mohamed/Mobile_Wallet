/*

every feature should have :

route 

model 
controller 
Middlewares


signup 


user 

model -> full name, .....balance,

router -> register -> login -> otp -> forgetPassword

controllers -> register -> login -> opt -> forgetPassword 


transactions 

transactionId, typeI(topUp, withdraw, transfer), amount, fromUserId, ToUserId, status, source, sourceDetails ->"sourceDetails": {
    "bankName": "Bank A",
    "accountNumber": "XXXXXX1234"
  },

  message, 
  destination, bankAccount, destinationDetails()


For top-ups: source (bank account, credit card), sourceDetails (JSON with bank/card details)
For transfers: message (optional message attached to the transfer)
For withdrawals: destination (bank account, service), destinationDetails (JSON with withdrawal destination details)



logs  || tix raac , 

logId, type (transction), details(JSON)
logId, type(error), details()
system 



------
// withdraw 

// id, userId, amount, time , created , updatedAt, description

// ----
// deposit

// id, userId, amount, from , description , date, created, updatedAt 

// ---
// transfer

// id, fromUser, fromAccount, toUser, amount,


request-yada in la xadido 



*/