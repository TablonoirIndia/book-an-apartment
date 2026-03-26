import Header from "./header";
import { FaArrowLeft } from "react-icons/fa";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import React, { useContext, useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { Modal, Button } from "react-bootstrap";
import { FaRegUserCircle } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  useParams,
} from "react-router-dom";

import { useNavigate } from "react-router-dom";

import UserDetailModal from "./UserDetailModal";

import AuthContext from "./AuthContext";

import * as apiUrl from "../apiUrl";
import * as imgUrl from "../apiUrl";

import EmiCalculatorModal from "../modals/EmiCalculatorModal";

import axios from "axios";

function PlotBookLayout() {
  const { isSignedIn, signIn, user } = useContext(AuthContext);

  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Function to handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setMessage("");
  };

  let { projectId, blockId, sectionId, plotId, userId } = useParams();

  const [Projects, setProjects] = useState([]);

  const [showUserDetailModal, setShowUserDetailModal] = useState(false);

  const handleShowUserDetailModal = () => {
    setShowUserDetailModal(true);
  };

  const handleCloseUserDetailModal = () => {
    setShowUserDetailModal(false);
  };

  const [clientDetails, setClientDetails] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    agentCode: "",
  });
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    plot_id: "",
    plot_number: "",
    plot_type: "",
    section: "",
    block: "",
    direction: "",
    area: "",
    price: "",
    block_id: "",
    user_id: "",
    project_id: "",
  });

  const handleClientDetailsChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));

    // Remove error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (user.user_type === "Agent") {
      if (!clientDetails.clientName) {
        newErrors.clientName = "Client Name is required.";
      }
      if (!clientDetails.clientPhone) {
        newErrors.clientPhone = "Client Phone is required.";
      } else if (!/^\d+$/.test(clientDetails.clientPhone)) {
        newErrors.clientPhone = "Client Phone must be a valid number.";
      }
      if (!clientDetails.clientEmail) {
        newErrors.clientEmail = "Client Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(clientDetails.clientEmail)) {
        newErrors.clientEmail = "Client Email must be a valid email.";
      }
    } else if (user.user_type === "User") {
      if (!clientDetails.agentCode) {
        newErrors.agentCode = "Agent Code is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      handleBookNow(e);
    } else {
      console.log("Validation failed:", errors);
    }
  };

  // const handleBookNow = async (e) => {
  //   e.preventDefault();

  //   // Add client or agent details to the userData object based on user type
  //   if (user.user_type === "Agent") {
  //     userData.clientName = clientDetails.clientName;
  //     userData.clientPhone = clientDetails.clientPhone;
  //     userData.clientEmail = clientDetails.clientEmail;
  //   } else if (user.user_type === "User") {
  //     userData.agentCode = clientDetails.agentCode;
  //   }

  //   try {
  //     const response = await axios.post(
  //       apiUrl.apiUrl + "/api/bookings/store",
  //       userData
  //     );
  //     console.log("Booking successful:", response.data);

  //     // On success, navigate to the booking process page
  //     navigate(`/bookingprocess/${projectId}/${plotId}/${userId}`);
  //   } catch (error) {
  //     // Handle validation errors (422)
  //     if (error.response && error.response.status === 422) {
  //       console.log("Validation errors:", error.response.data.errors);
  //     }
  //     // Handle plot already booked (400)
  //     else if (error.response && error.response.status === 400) {
  //       alert("The selected plot is already booked");
  //     }
  //     // Handle incorrect agent code (403)
  //     else if (error.response && error.response.status === 403) {
  //       alert("The Agent Code is wrong which you provided");
  //     }
  //     // Handle pending payment (402)
  //     else if (error.response && error.response.status === 402) {
  //       // const bookingId = error.response.data.booking_id;
  //       alert("The selected plot is already booked. Payment is pending.");

  //       // Navigate to payment page with the booking ID
  //       navigate(`/payment/${projectId}/${plotId}/${userId}`);
  //     }
  //     // General error handling
  //     else {
  //       console.error("Error booking plot:", error);
  //     }
  //   }
  // };

  const handleBookNow = async (e) => {
    e.preventDefault();
  
    // Add client or agent details to the userData object based on user type
    if (user.user_type === "Agent") {
      userData.clientName = clientDetails.clientName;
      userData.clientPhone = clientDetails.clientPhone;
      userData.clientEmail = clientDetails.clientEmail;
    } else if (user.user_type === "User") {
      userData.agentCode = clientDetails.agentCode;
    }
  
    try {
      const response = await axios.post(apiUrl.apiUrl + "/api/bookings/store", userData);
  
      // Handle different status codes within the try block
      if (response.status === 200 || response.status === 201) {
        // Successful booking, either proceed to the booking process or payment page
        if (response.data.redirect_to_payment) {
          setMessage(response.data.message);
          setShowModal(true);
          const bookingId = response.data.booking_id;
          setTimeout(() => {
            navigate(`/payment/${projectId}/${plotId}/${userId}`);
          }, 3000);
        } else {
          navigate(`/bookingprocess/${projectId}/${plotId}/${userId}`);
        }
      } else if (response.status === 400) {
        // Handle plot already booked
        setMessage(response.data.message);
        setShowModal(true);
      } else if (response.status === 403) {
        // Handle incorrect agent code
        setMessage(response.data.message);
        setShowModal(true);
      } else if (response.status === 402) {
        // Handle pending payment
        setMessage(response.data.message);
        setShowModal(true);
        setTimeout(() => {
          navigate(`/payment/${projectId}/${plotId}/${userId}`);
        }, 2000);
      }
    } catch (error) {
      // General error handling for network errors or unhandled cases
      setMessage("An error occurred while booking the plot.");
      setShowModal(true);
      console.error("Error booking plot:", error);
    }
  };
  

  const handleWishList = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        apiUrl.apiUrl + "/api/wishlist/store",
        userData
      );
      console.log("Wishlist Added Successfully:", response.data);

      window.location.reload();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.log("Validation errors:", error.response.data.errors);
      } else if (error.response && error.response.status === 400) {
        alert("The selected plot is already in your wishlist");
      } else {
        console.error("Error booking plot:", error);
      }
    }
  };

  const [plotDetail, setPlotDetail] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const [EmiCalculatorShow, setEmiCalculatorShow] = useState(false);
  const EmiCalculatorhandleClose = () => setEmiCalculatorShow(false);
  const EmiCalculatorhandleShow = () => setEmiCalculatorShow(true);

  useEffect(() => {
    if (plotId && userId) {
      // Fetch plot details
      fetch(apiUrl.apiUrl + `/api/plot-details/${plotId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setPlotDetail(data);
          setUserData((prevUserData) => ({
            ...prevUserData,
            plot_id: String(plotId),
            plot_number: data.plot_number,
            plot_type: data.plot_type,
            // section: data.section,
            block: data.blocks.block_name,
            direction: data.direction,
            area: data.plot_size,
            price: data.offer_price,
            block_id: data.blocks.id,
            project_id: data.project_id,
          }));
        })
        .catch((error) => {
          console.error(
            "There was a problem with fetching plot details:",
            error
          );
        });

      // Fetch user details
      fetch(apiUrl.apiUrl + `/api/users/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setUserDetail(data);
          setUserData((prevUserData) => ({
            ...prevUserData,
            name: data.user.name,
            phone: data.user.phone,
            user_id: String(userId),
          }));
        })
        .catch((error) => {
          console.error(
            "There was a problem with fetching user details:",
            error
          );
        });
    }
  }, [plotId, userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!projectId) return;

        // Project API Calling
        const projectresponse = await fetch(
          apiUrl.apiUrl + `/api/project/${projectId}`
        );
        if (!projectresponse.ok) {
          // Check if response is successful
          throw new Error("Failed to fetch data");
        }
        const projectdata = await projectresponse.json();
        setProjects(projectdata);
        // console.log(projectdata);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [projectId]);

  if (!plotDetail || !userDetail) {
    return null;
  }

  return (
    <main className="page-content">
      <Header />

      {isSignedIn && (
        <div className="flex-wrap common-top-spacing">
          <div className="amenities-div">
            <div className="sidebar-left-title">
              <h4>Booking</h4>
            </div>
          </div>

          <div className="block-div block-mobile-div">
            <div className="user-name">
              <p>{user.name} </p>
            </div>
            {/* <div className='user-icon'>
              <FaRegUserCircle />
            </div> */}
            <div className="user-icon" onClick={handleShowUserDetailModal}>
              <FaRegUserCircle />
            </div>
            <UserDetailModal
              show={showUserDetailModal}
              onClose={handleCloseUserDetailModal}
            />
          </div>

          <div className="block-img-div">
            <div className="block-img">
              <div className="popover-box popover-right">
                <a href="#">
                  {" "}
                  <FaArrowLeft /> Back
                </a>
                <a href="#" className="home-icon">
                  {" "}
                  <FaHome />
                </a>
              </div>
              <img
                src={
                  imgUrl.imgUrl +
                  `/storage/projects/${Projects.project_image_file}`
                }
                className="img-fluid"
                alt={Projects.project_name}
              />

              <div className="booking-form-div">
                <Form>
                  <div className="booking-box-content">
                    {/* <div className='img-div'>
                      <img src={imgUrl.imgUrl + `/storage/plots/${plotDetail.plot_image}`} className='img-fluid' alt={plotDetail.plot_number} />
                    </div> */}

                    <div className="content-div">
                      <div className="box-title">
                        <div className="box-logo">
                          <img
                            src={
                              imgUrl.imgUrl +
                              `/storage/projects/${Projects.logo_file}`
                            }
                            className="img-fluid"
                            alt={Projects.project_name}
                          />
                        </div>
                        <h2>
                          Block{" "}
                          <span className="orange-text">
                            {plotDetail.blocks.block_name}
                          </span>
                        </h2>
                        {/* <h2>Section <span className='orange-text'>{plotDetail.section}</span></h2> */}
                        <h2>
                          Plot No{" "}
                          <span className="orange-text">
                            {plotDetail.plot_number}
                          </span>
                        </h2>
                      </div>
                      <div className="booking-form">
                        <div className="form">
                          <a className="booking-box">
                            <small>Price</small>
                            <p>
                              <del>₹ {plotDetail.actual_price}</del>
                            </p>
                          </a>
                          <a className="booking-box">
                            <small>Offer Price</small>
                            <p>₹ {plotDetail.offer_price}</p>
                          </a>
                          <a className="booking-box">
                            <small>Area</small>
                            <p>{plotDetail.plot_size} sqft</p>
                          </a>
                          <a className="booking-box">
                            <small>Direction</small>
                            <p>{plotDetail.direction}</p>
                          </a>

                          <div>
                            {/* <input type="hidden" name="name" value={userData.name} /> */}
                            {/* <input type="hidden" name="phone" value={userData.phone} /> */}
                            <input
                              type="hidden"
                              name="plot_id"
                              value={plotDetail.id}
                            />
                            <input
                              type="hidden"
                              name="plot_number"
                              value={plotDetail.plot_number}
                            />
                            <input
                              type="hidden"
                              name="plot_type"
                              value={plotDetail.plot_type}
                            />
                            {/* <input type="hidden" name="section" value={plotDetail.section} /> */}
                            <input
                              type="hidden"
                              name="block"
                              value={plotDetail.blocks.block_name}
                            />
                            <input
                              type="hidden"
                              name="direction"
                              value={userData.direction}
                            />
                            <input
                              type="hidden"
                              name="area"
                              value={plotDetail.plot_size}
                            />
                            <input
                              type="hidden"
                              name="offer_price"
                              value={userData.price}
                            />
                            <input
                              type="hidden"
                              name="project_id"
                              value={projectId}
                            />
                            {/* <input type="hidden" name="user_id" value={userData.user_id} /> */}
                          </div>

                          {user.user_type === "Agent" ? (
                            <>
                              <Form.Group className="custom-form-group">
                                <Form.Label>Client Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="clientName"
                                  value={clientDetails.clientName}
                                  onChange={handleClientDetailsChange}
                                  isInvalid={!!errors.clientName}
                                  required
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.clientName}
                                </Form.Control.Feedback>
                              </Form.Group>
                              <Form.Group className="custom-form-group">
                                <Form.Label>Client Phone</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="clientPhone"
                                  value={clientDetails.clientPhone}
                                  onChange={handleClientDetailsChange}
                                  isInvalid={!!errors.clientPhone}
                                  required
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.clientPhone}
                                </Form.Control.Feedback>
                              </Form.Group>
                              <Form.Group className="custom-form-group">
                                <Form.Label>Client Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="clientEmail"
                                  value={clientDetails.clientEmail}
                                  onChange={handleClientDetailsChange}
                                  isInvalid={!!errors.clientEmail}
                                  required
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.clientEmail}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </>
                          ) : (
                            <Form.Group className="custom-form-group">
                              <Form.Label>Agent Code</Form.Label>
                              <Form.Control
                                type="text"
                                name="agentCode"
                                value={clientDetails.agentCode}
                                onChange={handleClientDetailsChange}
                                isInvalid={!!errors.agentCode}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.agentCode}
                              </Form.Control.Feedback>
                            </Form.Group>
                          )}

                          <div className="row wrap">
                            <Button
                              className="booking-btn"
                              onClick={EmiCalculatorhandleShow}
                            >
                              <span className="mat-button-wrapper">
                                <AccountBalanceWalletIcon fontSize="large" />
                                <span _ngcontent-vxp-c103="">
                                  EMI Calculator
                                </span>
                              </span>
                            </Button>
                            <Button
                              className="booking-btn-success"
                              onClick={handleSubmit}
                            >
                              <span className="mat-button-wrapper">
                                <span _ngcontent-vxp-c103="">Book Now</span>
                              </span>
                            </Button>
                            <Button
                              className="booking-btn-success"
                              onClick={handleWishList}
                            >
                              <span className="mat-button-wrapper">
                                <span _ngcontent-vxp-c103="">
                                  Add to Wishlist
                                </span>
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
          <div className="block-div block-large-div">
            <div className="user-name">
              <p>{user.name} </p>
            </div>
            {/* <div className='user-icon'>
              <FaRegUserCircle />
            </div> */}
            <div className="user-icon" onClick={handleShowUserDetailModal}>
              <FaRegUserCircle />
            </div>
            <UserDetailModal
              show={showUserDetailModal}
              onClose={handleCloseUserDetailModal}
            />
          </div>
        </div>
      )}

      {isSignedIn && (
        <div>
          <Modal
            className="filter-popup emi-calculator"
            show={EmiCalculatorShow}
            size="lg"
            onHide={EmiCalculatorhandleClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Body>
              <div className="close-button " onClick={EmiCalculatorhandleClose}>
                <div className="close-icon"></div>
              </div>
              <EmiCalculatorModal />
            </Modal.Body>
          </Modal>
        </div>
      )}
      {isSignedIn && (
        <div>
          {/* Modal for showing message */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Booking Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </main>
  );
}

export default PlotBookLayout;
