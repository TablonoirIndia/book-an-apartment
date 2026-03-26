import React, { useContext, useState, useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  useParams,
} from "react-router-dom";

import usericon from "../asserts/img/icon-user.png";
import { useNavigate } from "react-router-dom";

import AuthContext from "./AuthContext";
import * as apiUrl from "../apiUrl";
import axios from "axios";

const UserTable = () => {
  const { isSignedIn, signIn, user, signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const [BookingDetails, setBookingDetails] = useState([]);
  const [WishListDetails, setWishListDetails] = useState([]);

  let { projectId, blockId, sectionId, plotId } = useParams();
  const [key, setKey] = useState("user");

  const userId = user.id;

  useEffect(() => {
    const fetchData = async (user_id) => {
      try {
        if (!userId) return;

        // Booking API Calling
        const response = await fetch(
          apiUrl.apiUrl + `/api/bookings/booked-user/${userId}`
        );
        if (!response.ok) {
          // Check if response is successful
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setBookingDetails(data);

        console.log(data);

        // Wishlist API Calling
        const wishlistresponse = await fetch(
          apiUrl.apiUrl + `/api/wishlist/wishlist-user/${userId}`
        );
        if (!wishlistresponse.ok) {
          throw new Error("Failed to fetch data");
        }
        const wishlistdata = await wishlistresponse.json();
        setWishListDetails(wishlistdata);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(userId);
  }, [userId]);

  const handleBookNow = async (wishlist) => {
    const bookingData = {
      name: user.name,
      phone: user.phone,
      plot_id: wishlist.plot_id,
      plot_number: wishlist.plot_number,
      plot_type: wishlist.plot_type,
      section: wishlist.section,
      block: wishlist.block,
      direction: wishlist.direction,
      area: wishlist.area,
      price: wishlist.price,
      user_id: user.id,
      project_id: wishlist.project_id,
    };

    try {
      const response = await axios.post(
        apiUrl.apiUrl + "/api/bookings/store",
        bookingData
      );
      console.log("Booking successful:", response.data);

      // Remove wishlist item after successful booking
      await handleRemoveFromWishlist(wishlist.id);

      navigate(
        `/bookingprocess/${wishlist.project_id}/${wishlist.plot_id}/${user.id}`
      );
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.log("Validation errors:", error.response.data.errors);
      } else if (error.response && error.response.status === 400) {
        alert("The selected plot is already booked");
      } else {
        console.error("Error booking plot:", error);
      }
    }
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      const response = await fetch(
        apiUrl.apiUrl + `/api/wishlist/${wishlistId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to remove from wishlist");
      setWishListDetails((prevDetails) => ({
        ...prevDetails,
        wishlists: prevDetails.wishlists.filter(
          (wishlist) => wishlist.id !== wishlistId
        ),
      }));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking(id)
        .then((response) => {
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            bookings: prevDetails.bookings.filter(
              (booking) => booking.id !== id
            ),
          }));
        })
        .catch((error) => {
          console.error("Failed to cancel booking:", error);
        });
    }
  };

  const cancelBooking = async (id) => {
    const response = await fetch(apiUrl.apiUrl + `/api/cancel-booking/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  };

  return (
    <div className="instant-booking-bg">
      <div className="container-fluid">
        <div className="row instant-booking-row">
          <div className="col-md-12">
            <div className="instant-booking-card">
              <div className="instant-booking-row row">
                <div className="col-md-12">
                  <div className="filter-form-div">
                    <div className="filter-form-head">
                      <div className="user-info-div">
                        <img src={usericon} className="img-fluid" alt="User" />
                        <div className="user-info-details">
                          <h5>{user.name}</h5>
                          <p>{user.email} </p>
                          <p>{user.phone} </p>
                        </div>
                      </div>
                    </div>

                    <div className="filter-content-div">
                      <Tabs
                        id="controlled-tab-example"
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                        className="mb-3"
                      >
                        <Tab eventKey="user" title="Wishlist">
                          <div className="row filter-content">
                            <div className="col-md-12">
                              <table className="user-table-data">
                                <thead>
                                  <tr>
                                    <th scope="col">Project</th>
                                    <th scope="col">Block</th>
                                    <th scope="col">Flat NO</th>
                                    <th scope="col">Direction</th>
                                    <th scope="col">Square Ft</th>
                                    <th scope="col">Price</th>
                                    <th colSpan={2} scope="col">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {WishListDetails &&
                                  WishListDetails.wishlists &&
                                  WishListDetails.wishlists.length > 0 ? (
                                    WishListDetails.wishlists.map(
                                      (wishlist) => (
                                        <tr key={wishlist.id}>
                                          <td>
                                            {wishlist.project.project_name}
                                          </td>
                                          <td>{wishlist.block}</td>
                                          <td>{wishlist.plot_number}</td>
                                          <td>{wishlist.direction}</td>
                                          <td>{wishlist.area}</td>
                                          <td>{wishlist.price}</td>
                                          <td>
                                            <Button
                                              onClick={() =>
                                                handleBookNow(wishlist)
                                              }
                                              aria-label={`Book ${wishlist.plot_number}`}
                                            >
                                              Book
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleRemoveFromWishlist(
                                                  wishlist.id
                                                )
                                              }
                                              aria-label={`Remove ${wishlist.plot_number} from wishlist`}
                                            >
                                              Remove
                                            </Button>
                                          </td>
                                        </tr>
                                      )
                                    )
                                  ) : (
                                    <tr>
                                      <td colSpan="5" className="no-data">
                                        <p> No Data Found </p>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </Tab>

                        <Tab eventKey="reserved" title="Reserved">
                          <div className="row filter-content">
                            <div className="col-md-12">
                              <table className="user-table-data">
                                <thead>
                                  <tr>
                                    <th>Project</th>
                                    <th>Block</th>
                                    <th>Flat NO</th>
                                    <th>Direction</th>
                                    <th>Square Ft</th>
                                    <th>Price</th>
                                    <th>Payment Status</th>
                                  </tr>
                                </thead>                               
                                <tbody>
                                  {BookingDetails &&
                                  BookingDetails.bookings &&
                                  BookingDetails.bookings.length > 0 ? (
                                    BookingDetails.bookings.filter(
                                      (booking) =>
                                        booking.payment_status === "paid"
                                    ).length > 0 ? (
                                      BookingDetails.bookings
                                        .filter(
                                          (booking) =>
                                            booking.payment_status === "paid"
                                        )
                                        .map((booking) => (
                                          <tr key={booking.id}>
                                            <td>{booking.project_name}</td>
                                            <td>{booking.block}</td>
                                            <td>{booking.plot_number}</td>
                                            <td>{booking.direction}</td>
                                            <td>{booking.area}</td>
                                            <td>{booking.price}</td>
                                            <td>{booking.payment_status}</td>
                                          </tr>
                                        ))
                                    ) : (
                                      <tr>
                                        <td colSpan="7" className="no-data">
                                          <p>No Data Found</p>
                                        </td>
                                      </tr>
                                    )
                                  ) : (
                                    <tr>
                                      <td colSpan="7" className="no-data">
                                        <p>No Data Found</p>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </Tab>

                        <Tab eventKey="cancellation" title="Cancellation">
                          <div className="row filter-content">
                            <div className="col-md-12">
                              <table className="user-table-data">
                                <thead>
                                  <tr>
                                    <th>Project</th>
                                    <th>Block</th>
                                    <th>Flat NO</th>
                                    <th>Direction</th>
                                    <th>Square Ft</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {BookingDetails &&
                                  BookingDetails.bookings &&
                                  BookingDetails.bookings.length > 0 ? (
                                    BookingDetails.bookings.map((booking) => (
                                      <tr key={booking.id}>
                                        <td>{booking.project_name}</td>
                                        <td>{booking.block}</td>
                                        <td>{booking.plot_number}</td>
                                        <td>{booking.direction}</td>
                                        <td>{booking.area}</td>
                                        <td>{booking.price}</td>
                                        <td>
                                          <Button
                                            onClick={() =>
                                              handleCancel(booking.id)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="5" className="no-data">
                                        <p> No Data Found </p>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </Tab>

                        <Tab eventKey="booking-status" title="Booking Status">
                          <div className="row filter-content">
                            <div className="col-md-12">
                              <table className="user-table-data">
                                <thead>
                                  <tr>
                                    <th>Project</th>
                                    <th>Block</th>
                                    <th>Flat NO</th>
                                    <th>Direction</th>
                                    <th>Square Ft</th>
                                    <th>Price</th>
                                    <th>Payment Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {BookingDetails &&
                                  BookingDetails.bookings &&
                                  BookingDetails.bookings.length > 0 ? (
                                    BookingDetails.bookings.map((booking) => (
                                      <tr key={booking.id}>
                                        <td>{booking.project_name}</td>
                                        <td>{booking.block}</td>
                                        <td>{booking.plot_number}</td>
                                        <td>{booking.direction}</td>
                                        <td>{booking.area}</td>
                                        <td>{booking.price}</td>
                                        <td>{booking.payment_status}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="5" className="no-data">
                                        <p> No Data Found </p>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </Tab>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
