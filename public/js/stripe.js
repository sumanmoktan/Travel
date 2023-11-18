import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_51NxQCNJx780ERXsfRWY96yiau2Mrn3Q4bBEPAo85SQMiBBNRuxnmY66fZPfVgkCN0cyENLRa7SiBwraPM4uRUZkc00lUH3B1Z4');


export const bookTour = async tourId =>{
    try{
    //Get checkout session form api
    const session = await axios(
        `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    )
    console.log(session);

    //create a checkout form + chance of creadit card
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });

    
    }catch(err){
        console.log(err);
        showAlert('error', err);

    }

}
