import React, { useState } from 'react';
import axios from 'axios';
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js';

const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {
            iconColor: "#c4f0ff",
            color: "#fff",
            fontWeight: 500,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": { color: "#fce883" },
            "::placeholder": { color: "#87bbfd" }
        },
        invalid: {
            iconColor: "#ffc7ee",
            color: "#ffc7ee"
        }
    }
}

const PaymentForm = () => {
    const [success, setSuccess] = useState(false);
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
            billing_details: {
                address: {
                    line1: '1234 Address St',
                    city: 'City',
                    state: 'State',
                    postal_code: '12345',
                    country: 'In',
                },
                email: "nijas@gmail.com",
                name: "Nijas",
                phone: 8547031325
            },
        });
        if (!error) {
            try {
                const { id } = paymentMethod;
                const response = await axios.post('http://localhost:4000/payment', {
                    amount: 1000,
                    id
                });
                if (response.data.requiresAction) {
                    console.log("url", response.data.paymentIntent.use_stripe_sdk);
                    window.open(response.data.paymentIntent.use_stripe_sdk.stripe_js, '_blank');
                    // window.location.href = response.data.paymentIntent.use_stripe_sdk.stripe_js;
                    const successRes = await axios.post('http://localhost:4000/complete-payment', {
                        paymentIntentId: response.data.paymentIntentId
                    });
                    if (successRes.data.paymentIntent.status==='success') {
                        console.log("success", successRes.data.paymentIntentId)
                        setSuccess(true);
                    }
                    else if(successRes.data.paymentIntent.status==='requires_action'){
                        console.log("requires_action", successRes.data.paymentIntentId);
                        const hookStatus = await axios.post('http://localhost:4000/webhook');
                        console.log(hookStatus, "hookStatus");
                        if (hookStatus.data.success==='success') {
                            console.log("payment successfull");
                            setSuccess(true);
                        }
                    }
                } else if (response.data.success) {
                    console.log("payment_successfull_No3D_Secure");
                    setSuccess(true);
                } else {
                    console.log("payment failed !!!");
                }
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log(error.message);
        }
    }

    return (
        <>
            {!success ?
                (
                    <form onSubmit={handleSubmit}>
                        <fieldset className='FormGroup'>
                            <div className='FormRow'>
                                <CardElement options={CARD_OPTIONS} />
                            </div>
                        </fieldset>
                        <button>Pay</button>
                    </form>
                ) : (
                    <>
                        <h2>You just bought the play Station 5 😎</h2>
                    </>
                )
            }
        </>
    )
}

export default PaymentForm;
