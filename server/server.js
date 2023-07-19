const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4000;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

app.use(cors());

app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'sever test success'
    });
});

app.post('/payment', express.json(), cors(), async (req, res) => {
    try {
        const { amount, id } = req.body;
        const payment = await stripe.paymentIntents.create({
            amount,
            currency: 'inr',
            description: 'tech_company',
            payment_method: id,
            confirm: true,
            // Set up future usage for off-session payments
            setup_future_usage: 'off_session'
        });
        console.log("payment: ", payment);
        if (payment.status === 'requires_action' && payment.next_action.type === 'use_stripe_sdk') {
            return res.json({ requiresAction: true, paymentIntentId: payment.id, clientSecret: payment.client_secret, paymentIntent: payment.next_action });
        }
        // if 3D auth not needed 
        res.status(200).json({
            success: true,
            message: "payment successful"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// let paymentObject=[];
app.post('/complete-payment', express.json(), async (req, res) => {
    try {
        console.log("complete-pyament route reached", req.body);
        const { paymentIntentId } = req.body;
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
        console.log("payment success purchased success: ", paymentIntent)
        // paymentObject.push({
        //     paymentId: paymentIntent.id,
        //     payment: false
        // })
        return res.json({ success: true, paymentIntentId: paymentIntent.id, paymentIntent });
    } catch (err) {
        console.error('Error confirming payment intent:', err);
        return res.status(500).json({ error: err.message });
    }
});

// add condition for checking if the event.type is paymentIntent.succeeded
let paymentSuccess=false;
app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    // const event = request.body;
    console.log(request.body , 'req');
    const event = JSON.parse(request.body.toString('utf8'));
    console.log(event, "event");
    if(event.type==='payment_intent.succeeded'){
        console.log("entered the condition statement !!!");
        paymentSuccess = event.data.object.status;
        // paymentObject.forEach((payment=>{
        //     console.log(payment.paymentId, "paymentId");
        //     console.log(event.data.object.id, "paymentId");
        //     if(payment.paymentId===event.data.object.id) {
        //         console.log("matched id", payment.paymentId);
        //         payment.payment=true;
        //         console.log(payment.payment, "changed status");
        //     }
        // }));
    }else{
        response.status(400).json({
            status:false
        });
    }
    response.status(200).json({
        status: true,
        message: 'webhook received'
    });
});

// testing pending
app.get('/statusCheck', express.json(), (req, res)=>{
    res.status(200).json({
        success: true,
        paymentSuccess: paymentSuccess
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});