import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

const STRIPE_PUBLIC_kEY = 'pk_test_51NSxJiSCxJ4SzifXvjq3zlmjVZESbavx02oaEHWqRMpy6pJO2Bab3Lp7HwxErhA3XZHNNZhyoAKYVQIF2Qc2csda00qlaZWAKH';

const stripePromise = loadStripe(STRIPE_PUBLIC_kEY);

const StripeContainer = () => {
    return (
        <div>
            <Elements stripe={stripePromise}>
                <PaymentForm />
            </Elements>
        </div>
    )
}

export default StripeContainer;
