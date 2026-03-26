// // export default PaymentLayout;
// import React, { useContext, useState, useEffect } from 'react';
// import Form from "react-bootstrap/Form";
// import { useParams } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

// import * as apiUrl from '../apiUrl';
// import axios from 'axios';

// import AuthContext from './AuthContext';

// function PaymentLayout() {
//     const { isSignedIn, signIn, user } = useContext(AuthContext);
//     const navigate = useNavigate();

//     let { projectId, plotId, userId } = useParams();  

//     const [Projects, setProjects] = useState([]);
//     const [amount, setAmount] = useState(1); // Fixed amount for now

//     useEffect(() => {
//         const fetchData = async (projectId, plotId, userId) => {
//             try {
//                 if (!projectId || !plotId || !userId) return;

//                 // API call to fetch booking/project data
//                 const projectresponse = await axios.get(apiUrl.apiUrl + `/api/bookings/booked-detail/${projectId}/${plotId}/${userId}`);
//                 setProjects(projectresponse.data);
               
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };

//         fetchData(projectId, plotId, userId);
//     }, [projectId, plotId, userId]);

//     // Razorpay Payment Handler
//     const handlePayment = async () => {
//         try {                    
//             if (Projects?.users && Projects?.users[0]) {
//                 console.log(Projects.users[0].id);
//             }

//             const response = await axios.post(apiUrl.apiUrl + '/api/create-order', {
//                 amount: amount,
//                 user_id: userId, // Ensure userId is passed
//                 booking_id: Projects.bookings[0].id, // Assuming plotId is your booking ID
//             });
//             const { order_id, razorpay_key } = response.data;
                      
//             // Options for Razorpay checkout
//             const options = {
//                 key: razorpay_key, 
//                 amount: amount * 100, 
//                 currency: 'INR',
//                 name: Projects?.project[0]?.project_name || 'Sameera',
//                 description: 'Test Transaction',
//                 image: Projects?.project[0]?.logo_file || 'Sameera', 
//                 order_id: order_id, // Generated order ID from Laravel
//                 handler: async function (response) {
//                     // Send payment confirmation to backend (Laravel)
//                     const paymentData = {
//                         payment_id: response.razorpay_payment_id,
//                         order_id: response.razorpay_order_id,
//                         signature: response.razorpay_signature,
//                     };

//                     const paymentVerificationResponse = await axios.post(apiUrl.apiUrl + `/api/payment-handler`, paymentData);
//                     alert(paymentVerificationResponse.data.status);
                    
//                     if (paymentVerificationResponse.data.status === 'Payment successful') {
//                         // Redirect to success page
//                         navigate(`/payment-success`);
//                     } else {
//                         // Handle payment failure
//                         alert('Payment failed');
//                     }
//                 },
//                 prefill: {
//                     name: Projects?.users[0]?.name || "Guest",
//                     email: Projects?.users[0]?.email || "guest@example.com",
//                     contact: Projects?.users[0]?.phone ||"9999999999",
//                 },
//                 theme: {
//                     color: '#F37254',
//                 },
//             };

//             // Open Razorpay Checkout
//             const rzp = new window.Razorpay(options);
//             rzp.open();

//         } catch (error) {
//             console.error('Error in payment:', error);
//         }
//     };

   

//     return (
//         <main className='page-content'>
//             {isSignedIn && (
//                 <div className='booking-process-div'>
//                     <div className='container'>
//                         <div className='flex'>
//                             <div className='center-box'>
//                                 <div className='flex'>

//                                     <div className="top_title_box">
//                                         <h1 className="top_title"><b>Booking Summary</b></h1>
//                                         <p>You are one step away from booking your dream home</p>
//                                     </div>

//                                     <div className='inner_box' style={{ height: '431px' }}>
//                                         <div className='inner_border flex_box_wrp'>
//                                             <div className="flex">
//                                                 <div className="title text-center">
//                                                     <h2>Booking Summary</h2>
//                                                 </div>

//                                                 <div className="details m_h_200 pt_1">
//                                                     {Projects?.users?.map((user) => (
//                                                         <div key={user.id} className="input_label">
//                                                             Name: <span><b>{user.name}</b></span>
//                                                         </div>
//                                                     ))}
//                                                     {Projects?.users?.map((user) => (
//                                                         <div key={user.id} className="input_label">
//                                                             Email: <span><b>{user.email}</b></span>
//                                                         </div>
//                                                     ))}
//                                                     {Projects?.project?.map((project) => (
//                                                         <div key={project.id} className="input_label">
//                                                             Project Name: <span><b>{project.project_name}</b></span>
//                                                         </div>
//                                                     ))}
//                                                     <div className="input_label">
//                                                         Amount: <span><b>{amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</b></span>
//                                                     </div>
//                                                 </div>

//                                                 <Form>
//                                                     <Form.Control type="hidden" name="merchant_order_id" value="provident3897-18" />
//                                                     <Form.Control type="button" value="Pay Now" onClick={handlePayment} className="button pay_btn new_pay_button razorpay-payment-button" />
//                                                 </Form>

//                                             </div>
//                                         </div>
//                                     </div>

//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </main>
//     );
// }

// export default PaymentLayout;

import React, { useContext, useState, useEffect } from 'react';
import Form from "react-bootstrap/Form";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import * as apiUrl from '../apiUrl';
import axios from 'axios';
import AuthContext from './AuthContext';

function PaymentLayout() {
    const { isSignedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    let { projectId, plotId, userId } = useParams();  

    const [Projects, setProjects] = useState([]);
    const [amount, setAmount] = useState(1); // Initial amount

    useEffect(() => {
        const fetchData = async (projectId, plotId, userId) => {
            try {
                if (!projectId || !plotId || !userId) return;

                // API call to fetch booking/project data
                const projectresponse = await axios.get(apiUrl.apiUrl + `/api/bookings/booked-detail/${projectId}/${plotId}/${userId}`);
                setProjects(projectresponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(projectId, plotId, userId);
    }, [projectId, plotId, userId]);

    // Razorpay Payment Handler
    const handlePayment = async () => {
        try {                    
            const response = await axios.post(apiUrl.apiUrl + '/api/create-order', {
                amount: amount,
                user_id: userId,
                booking_id: Projects.bookings[0].id,
            });
            const { order_id, razorpay_key } = response.data;
                      
            // Options for Razorpay checkout
            const options = {
                key: razorpay_key,
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                name: Projects?.project[0]?.project_name || 'Sameera',
                description: 'Test Transaction',
                image: Projects?.project[0]?.logo_file || 'Sameera', 
                order_id: order_id,
                handler: async function (response) {
                    const paymentData = {
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id,
                        signature: response.razorpay_signature,
                    };

                    const paymentVerificationResponse = await axios.post(apiUrl.apiUrl + `/api/payment-handler`, paymentData);
                    alert(paymentVerificationResponse.data.status);
                    
                    if (paymentVerificationResponse.data.status === 'Payment successful') {
                        navigate(`/payment-success`);
                    } else {
                        alert('Payment failed');
                    }
                },
                prefill: {
                    name: Projects?.users[0]?.name || "Guest",
                    email: Projects?.users[0]?.email || "guest@example.com",
                    contact: Projects?.users[0]?.phone ||"9999999999",
                },
                theme: {
                    color: '#F37254',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Error in payment:', error);
        }
    };

    return (
        <main className='page-content'>
            {isSignedIn && (
                <div className='booking-process-div'>
                    <div className='container'>
                        <div className='flex'>
                            <div className='center-box'>
                                <div className='flex'>

                                    <div className="top_title_box">
                                        <h1 className="top_title"><b>Booking Summary</b></h1>
                                        <p>You are one step away from booking your dream home</p>
                                    </div>

                                    <div className='inner_box' style={{ height: '431px' }}>
                                        <div className='inner_border flex_box_wrp'>
                                            <div className="flex">
                                                <div className="title text-center">
                                                    <h2>Booking Summary</h2>
                                                </div>

                                                <div className="details m_h_200 pt_1">
                                                    {Projects?.users?.map((user) => (
                                                        <div key={user.id} className="input_label">
                                                            Name: <span><b>{user.name}</b></span>
                                                        </div>
                                                    ))}
                                                    {Projects?.users?.map((user) => (
                                                        <div key={user.id} className="input_label">
                                                            Email: <span><b>{user.email}</b></span>
                                                        </div>
                                                    ))}
                                                    {Projects?.project?.map((project) => (
                                                        <div key={project.id} className="input_label">
                                                            Project Name: <span><b>{project.project_name}</b></span>
                                                        </div>
                                                    ))}
                                                    <div className="input_label">
                                                        Amount: <span><b>{amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</b></span>
                                                    </div>
                                                </div>

                                                {/* New Amount Input Field */}
                                                <Form>
                                                    <Form.Group controlId="formBasicAmount">
                                                        <Form.Label>Enter Amount</Form.Label>
                                                        <Form.Control 
                                                            type="text" 
                                                            value={amount} 
                                                            onChange={(e) => setAmount(e.target.value)} 
                                                            min="1" 
                                                            required 
                                                        />
                                                    </Form.Group>
                                                    <Form.Control type="hidden" name="merchant_order_id" value="provident3897-18" />
                                                    <Form.Control 
                                                        type="button" 
                                                        value="Pay Now" 
                                                        onClick={handlePayment} 
                                                        className="button pay_btn new_pay_button razorpay-payment-button" 
                                                    />
                                                </Form>

                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default PaymentLayout;

