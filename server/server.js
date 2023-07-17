const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4000;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'sever test success'
    });
});

app.post('/payment', cors(), async (req, res) => {
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


app.post('/complete-payment', async (req, res) => {
    try {
        console.log("complete-pyament route reached", req.body);
        const { paymentIntentId } = req.body;
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
        console.log("payment success purchased success: ", paymentIntent)
        return res.json({ success: true, paymentIntentId: paymentIntent.id, paymentIntent });
    } catch (err) {
        console.error('Error confirming payment intent:', err);
        return res.status(500).json({ error: err.message });
    }
});


const endpointSecret = 'whsec_475209d9fdf75901c1c42c6be71a4296701075e4c3cf268b3302fbec3fc0501e';

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const event = request.body;
    let status;
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            status = 'success';
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            status = paymentMethod.status;
            console.log('PaymentMethod was attached to a Customer!');
            break;
        // ... handle other event types
        case 'charge.succeeded':
            const chargeSucceeded = event.data.object;
            status = 'success';
            console.log(chargeSucceeded, "charge succeeded");
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.status(200).json({
        success: 'success',
        message: "payment successful",
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});