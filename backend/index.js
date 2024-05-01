const express = require('express')
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const menuRoutes = require('./api/routes/menuRoutes');
const cartRoutes = require('./api/routes/cartRoutes');
const userRoutes = require('./api/routes/userRoutes');
const paymentRoutes = require('./api/routes/paymentRoutes');

const port = process.env.PORT || 6005;

//middleware
const corsOptions ={
  origin:'https://fttoodie-server.onrender.com', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));

app.use(express.json());

//mongodb configurations
mongoose
.connect(
`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.m5zvjip.mongodb.net/dbfttoodie?retryWrites=true&w=majority&appName=Cluster0`)
.then(
    console.log("MongoDB Connected successfully")
)
.catch((error) => console.log("Error connecting to mongodb", error));

// jwt authentication
app.post('/jwt', async(req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1hr'
  })
  res.send({token});
})

//import routes
app.use('/menu', menuRoutes);
app.use('/carts', cartRoutes);
app.use('/users', userRoutes);
app.use('/payment', paymentRoutes);
//stripe payment routes
app.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price*100);

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
    
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})