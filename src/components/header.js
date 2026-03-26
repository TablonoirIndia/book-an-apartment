import React, { Fragment } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import { BrowserRouter as Router, Link, Route, Switch, useParams } from "react-router-dom";

const Header = () => {

  let { projectId, masterPlanId, blockId, sectionId, plotId } = useParams();

  const location = useLocation();

    const isActive = (path) => {
    return location.pathname.startsWith(path);
  };


  return (
    <Fragment>
      {/* Header Start */}
      <Navbar fixed="top" expand="lg" className="plot-navbar">
        <Container className="plot-navBG">
          <Navbar.Toggle aria-controls="basic-navbar-nav" id="basic-navbar-nav" />
          <Navbar.Collapse className="justify-content-center" id="basic-navbar-nav">

            <Nav.Item className={`${isActive(`/location/${projectId}`) || isActive(`/masterplan/${projectId}`) || isActive(`/block/${projectId}/${masterPlanId}/${blockId}`) || isActive(`/section/${projectId}/${blockId}/${sectionId}`) || isActive(`/selected-plot/${projectId}/${blockId}/${sectionId}/${plotId}`) || isActive(`/booking/${projectId}/${plotId}`) ? 'active' : ''}`}>
              <NavLink to={`/location/${projectId}`} className='nav-link'>
                Location
              </NavLink>
            </Nav.Item>

            <Nav.Item className={`${isActive(`/masterplan/${projectId}`) || isActive(`/block/${projectId}/${masterPlanId}/${blockId}`) || isActive(`/section/${projectId}/${blockId}/${sectionId}`) || isActive(`/selected-plot/${projectId}/${blockId}/${sectionId}/${plotId}`) || isActive(`/booking/${projectId}/${plotId}`) ? 'active' : ''}`}>
              <NavLink to={`/masterplan/${projectId}`} className='nav-link'>
                Master Plan
              </NavLink>
            </Nav.Item>
            <Nav.Item className={`${isActive(`/block/${projectId}/${masterPlanId}/${blockId}`) || isActive(`/section/${projectId}/${blockId}/${sectionId}`) || isActive(`/selected-plot/${projectId}/${blockId}/${sectionId}/${plotId}`) || isActive(`/booking/${projectId}/${plotId}`) ? 'active' : ''}`}>
              <NavLink className='nav-link'>
                Phase
              </NavLink>
            </Nav.Item>
            {/* <Nav.Item className={`${isActive(`/section/${projectId}/${blockId}/${sectionId}`) || isActive(`/selected-plot/${projectId}/${blockId}/${sectionId}/${plotId}`) || isActive(`/booking/${projectId}/${plotId}`) ? 'active' : ''}`}>
              <NavLink className='nav-link'>
                Section
              </NavLink>
            </Nav.Item> */}
            <Nav.Item className={`${isActive(`/selected-plot/${projectId}/${blockId}/${sectionId}/${plotId}`) || isActive(`/booking/${projectId}/${plotId}`) ? 'active' : ''}`}>
              <NavLink className='nav-link'>
                Plot
              </NavLink>
            </Nav.Item>
            <Nav.Item className={`${isActive("/instant-booking") ? 'active' : ''}`}>
              <NavLink to={`/instant-booking`} className='nav-link'>
                Booking
              </NavLink>
            </Nav.Item>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Fragment>
  );
};

export default Header;

