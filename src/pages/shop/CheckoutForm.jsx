import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useEffect, useState } from 'react'
import { FaPaypal } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useNavigate } from 'react-router-dom';


const CheckoutForm = ({price, cart}) => {
    const stripe = useStripe();
    const elements = useElements();
    const {user} = useAuth();
    const axiosSecure = useAxiosSecure();
    const [cardError, setCardError] = useState('');
    const [clientSecret, setclientSecret] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
       if (typeof price !== 'number' || price < 1) {
             return;
       }
       axiosSecure.post('/create-payment-intent', {price})
       .then( res => {
         console.log(res.data);
       }

       )
    }, [price, axiosSecure])
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form su bmission until Stripe.js has loaded.
            return;
          }
          const card = elements.getElement(CardElement);

          if (card == null) {
            return;
          }
      
          // Use your card Element with other Stripe.js APIs
          const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card,
          });
          if (error) {
            console.log('[error]', error);
            setCardError(error.message)
          } else {
            setCardError("success")
            console.log('[PaymentMethod]', paymentMethod);
          }

          const {paymentIntent, error:confirmError}= await stripe.confirmCardPayment(
            clientSecret, {
               payment_method: {
               card: card,
               billing_details: {
               name: user?.displayName || 'anonymous',
               email: user?.email || 'unknown'
      },
    },
  })
  .then(function(result) {
    // Handle result.error or result.paymentIntent
  });
    if (confirmError) {
      console.log(confirmError)
    }
    console.log(paymentIntent);
    if (paymentIntent.status === "succeeded") {
       console.log(paymentIntent.id)
       setCardError('Your transactionId is ${paymentIntent.id}')
       //payment info
       const paymentInfo = {
        email: user.email,
        transitionId: paymentIntent.id,
        price,
        quantity: cart.length,
        status: "Order pending",
        itemName: cart.map(item => item.name),
        cartItems: cart.map(item =>item_id),
        mIdenuItems: cart.map(item => item.menuItem)
       }
       console.log(paymentInfo);

       axiosSecure.post('/payments', paymentInfo)
       .then(res =>{
           console.log(res.data);
           alert("payments successful");
           navigate('/Order')

       })
    }
    };
  return (
    <div className='flex flex-col sm:flex-row justify-start gap-8'>
        <div className='md:w-1/2 w-full space-y-3'>
           <h4 className='text-lg font-semibold'>Order Summary</h4>
           <p>Total price: ${price}</p>
           <p>Number of items: {cart.length}</p>
        </div>
        <div className='md:w-1/2 w-full space-y-5 card shrink-0 w-full max-w-sm shadow-2xl bg-base-100 px-4 py-8'>
        <h4 className='text-lg font-semibold'>Process your payment</h4>
        <h5 className='font-medium:'>Credit/Debit card</h5>
        <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      <button type="submit" disabled={!stripe} className='btn btn-sm mt-5 btn-primary w-full text-white'>
        Pay
      </button>
    </form>
    {
        cardError ? <p className='text-red italic text-xs'>{cardError}</p> : ""
    }
    <div className='mt-5 text-center'>
        <hr />
        <button type="submit" className='btn btn-sm mt-5 bg-orange-500 text-white'>
        <FaPaypal/> Pay with paypal
      </button>
    </div>
        </div>
    </div>
  )
}

export default CheckoutForm