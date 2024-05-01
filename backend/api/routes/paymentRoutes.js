const express = require('express');
const Payment = require('../models/Payments');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken')
const Cart = require('../models/Carts')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
 
router.post('/', verifyToken, async(req, res) =>{
    const payment = req.body;
    try {
     const paymentRequest = await Payment.create(payment);
     //delete cart after payments
     const cartIds = payment.cartItems.map(id => new ObjectId(id));
     const deleteCartRequest = await Cart.deleteMany({_id: {$in: cartIds}});
     res.status(200).json({paymentRequest, deleteCartRequest})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.get('/', verifyToken, async(req, res)=>{
   const email = req.query.email;
   const query = {email: email};
   try {
     const decodedEmail = req.decoded.Email;
     if (email !== decodedEmail) {
        res.status(403).json({message: "forbidden Access"})
     }
     const result = await Payment.find(query).sort({createdAt: -1}).exec();
     res.status(200).json(result);
   } catch (error) {
    res.status(500).json({ message: error.message });
   }
})
module.exports = router;