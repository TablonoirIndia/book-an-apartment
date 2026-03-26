import React, {useContext, useState, useEffect } from 'react';
import Form from "react-bootstrap/Form";

import { BrowserRouter as Router, Link, Route, Switch, useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import AuthContext from './AuthContext';

import * as apiUrl from '../apiUrl';
import * as imgUrl from '../apiUrl';

import logo from '../asserts/img/logo.png';

import axios from 'axios';
import { useBootstrapBreakpoints } from 'react-bootstrap/esm/ThemeProvider';

function BookingProcessLayout() {

    const { isSignedIn, signIn, user } = useContext(AuthContext);

    const navigate = useNavigate();

    let { projectId, plotId, userId } = useParams();

    const [Projects, setProjects] = useState([]);    

    // console.log(userId);

    useEffect(() => {
        const fetchData = async (projectId, plotId, userId) => {
            try {
                if (!projectId && !plotId && !userId) return;

                // Project API Calling
                const projectresponse = await fetch(apiUrl.apiUrl + `/api/bookings/booked-detail/${projectId}/${plotId}/${userId}`);
                if (!projectresponse.ok) { // Check if response is successful
                    throw new Error('Failed to fetch data');
                }
                const projectdata = await projectresponse.json();
                setProjects(projectdata);
                // console.log(projectdata);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(projectId, plotId, userId);
    }, [projectId, plotId, userId]);

    const handleButtonClick = () => {
        navigate(`/payment/${projectId}/${plotId}/${userId}`);
    };
    


    return (

        <main className='page-content'>
             {isSignedIn && (
            <div className='booking-process-div'>

                <div className='flex'>
                    <div className='center-box'>
                        <div className='inner_box'>
                            <div className='inner_border flex_box_wrp'>
                                <div className='flex'>
                                    <div className='logo'>
                                        <img src={logo} alt="" />
                                    </div>
                                    <div className='details'>
                                        {Projects && Projects.project && Projects.project.map((projects) => (
                                            <div className="project_name" key={projects.id}>
                                                <p><b>{projects.project_name}</b></p>
                                            </div>
                                        ))}

                                        {Projects && Projects.plots && Projects.plots.map((plot) => (
                                            <div className="unit_type" key={plot.id}>
                                                <p style={{ textAlign: 'left' }} >
                                                    <b>Configuration: {plot.plot_type}</b>
                                                </p>
                                            </div>
                                        ))}

                                        {Projects && Projects.plots && Projects.plots.map((plot) => (
                                            <div className="pre-launch-price text-left" key={plot.id}>
                                                <p> <b className="regular_price">Price:</b>
                                                    <span className="strikethrough-text"><b>₹ {plot.actual_price &&
                                                        plot.actual_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b>
                                                    </span>
                                                </p>
                                            </div>
                                        ))}

                                        {Projects && Projects.plots && Projects.plots.map((plot) => (
                                            <div className="pre-launch-price text-left" key={plot.id}>
                                                <p>Offer Price: <span className=""><b>₹ {
                                                    plot.offer_price &&
                                                    plot.offer_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                }</b></span> </p>
                                            </div>
                                        ))}

                                        {Projects && Projects.plots && Projects.plots.map((plot) => (
                                            <div className="pre-launch-price text-left" key={plot.id}>
                                                <p>You have saved: <span id="saved_amount_change"><b>₹ {(plot.actual_price - plot.offer_price).toLocaleString()} </b></span> </p>
                                            </div>
                                        ))}

                                        {Projects && Projects.plots && Projects.plots.map((plot) => (
                                            <div className="pre-launch-price text-left" key={plot.id}>
                                                <p>
                                                    <b id="final-price"> Final Price : ₹ {
                                                    plot.offer_price &&
                                                    plot.offer_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                }.00*</b>
                                                </p>
                                            </div>
                                        ))}
                                        <span style={{ fontSize: '10px' }}>*The final price does not include statutory charges , clubhouse charges &amp; section C</span>

                                        <div className="media_new coupon_wrp">
                                            <div className="price-saved-new" >
                                                {/* <h4><b>Apply Coupon Code</b></h4> */}
                                            </div>

                                            <Form className="left_align">
                                                <Form.Group className="price coupon_inut_new">
                                                    <Form.Control type="text" placeholder="Enter Coupon Code" className="form-field" id="coupon_no" />
                                                </Form.Group>

                                                <div className="price-coupon apply_coupon_button">
                                                    <a href="#" className="button apply-coupon">Apply coupon Code</a>
                                                </div>
                                                <div className="clear"></div>
                                                {/* <p>Use code  to save additional ₹ 50000</p> */}
                                                <p>Apply coupon code to save additional ₹ 1,00,000 </p>
                                                <h5 id="coupon-redeem-msg"></h5>
                                                <h4>Booking Amount :<span className="">
                                                    <b id="booking_amount">₹ 2,00,000.00</b></span>
                                                </h4>
                                            </Form>

                                        </div>
                                    </div>
                                    <div className="profile-top-ba">
                                        <div className="price-saved">
                                            <button type="submit" className="submit button pay_btn new_pay_button" id="submit" onClick={handleButtonClick}>Proceed to Pay</button>
                                        </div>
                                    </div>

                                </div>


                            </div>

                        </div>

                    </div>
                </div>
            </div>
           )} 
        </main >
    );
}

export default BookingProcessLayout;

