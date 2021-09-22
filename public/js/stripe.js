/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51Jc4xtKhSeYKpFErbhZSPTY4qNKkJTBU5tgvY6LGnZTQrM4Zesgkpdg9Ytnb0fB2MXCV0xFzZzom8qIXKF9bxoQ500w3Frhz9b'
);

export const bookTour = async (tourId) => {
  try {
    // GET CHECKOUT SESSION FROM END POINT
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);

    // CREATE THE CHECKOUT FORM AND CHARGE THE CREDIT CARD
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('Error', err);
  }
};
