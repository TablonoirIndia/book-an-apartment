import Header from './header';
import { FaArrowLeft } from "react-icons/fa";
import React, { useContext, useState, useEffect } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaRegWindowClose } from "react-icons/fa";
import Form from 'react-bootstrap/Form';

import { BrowserRouter as Router, Link, Route, Switch, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import SignInModal from './SignInSignUpModal';
import AuthContext from './AuthContext';

import * as apiUrl from '../apiUrl';
import * as imgUrl from '../apiUrl';

import axios from 'axios';

function InstantBooking() {

  const { isSignedIn, signIn, user, signOut } = useContext(AuthContext);
  const [showSignInModal, setShowSignInModal] = useState('');
  const [signedIn, setSignedIn] = useState(isSignedIn);
  const [successMessage, setSuccessMessage] = useState('');

  const [userId, setUserId] = useState(user ? user.id : null);

  // const userId = user ? user.id : null;

  useEffect(() => {
    if (isSignedIn && user) {
      setUserId(user.id);
    }
  }, [isSignedIn, user]);

  // useEffect(() => {
  //   setShowSignInModal(isSignedIn);
  // }, [isSignedIn]);

  const handleClose = () => {
    if (!isSignedIn) {
      setShowSignInModal(true);
    }else{
      setShowSignInModal(false);
    }
  };

  // const handleClose = () => {
  //   setShowSignInModal(!isSignedIn);
  // };


  const navigate = useNavigate();

  // let { projectId, plotId } = useParams();

  const [Sections, setSections] = useState([]);
  const [Blocks, setBlocks] = useState([]);
  const [Projects, setProjects] = useState([]);
  const [Plots, setPlots] = useState([]);

  const [locationName, setlocationName] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [projectLogo, setProjectLogo] = useState('');

  const [projectName, setProjectName] = useState('');
  const [block, setBlock] = useState('');
  const [section, setSection] = useState('');
  const [unit, setUnit] = useState('');

  const [formErrors, setFormErrors] = useState({});

  const handleProceed = (userId) => {
    // Validate form fields
    const errors = {};
    if (!projectName) {
      errors.projectName = 'Please Select Project';
    }
    if (!block) {
      errors.block = 'Please Select Block';
    }
    // if (!section) {
    //   errors.section = 'Please Select Section';
    // }
    if (!unit) {
      errors.unit = 'Please Select Unit';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      setFormErrors({});
      // setShowSignInModal(true);
      // navigate(`/booking/${projectName}/${unit}/${userId}`);
      if (!isSignedIn) {
        setShowSignInModal(true);
      } else {
        navigate(`/booking/${projectName}/${unit}/${userId}`);
      }
    }

  };
 
  const handleSignInSuccess = (userId) => {
    // console.log (userId);
    if (userId) {
      setUserId(userId);
      setShowSignInModal(false);
      navigate(`/booking/${projectName}/${unit}/${userId}`);
    }
  };

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectresponse = await fetch(apiUrl.apiUrl + `/api/all-projects`);
        if (!projectresponse.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const projectdata = await projectresponse.json();
        setProjects(projectdata);

        // Set the first project as selected by default
        if (projectdata.length > 0) {
          const firstProjectId = projectdata[0].id;
          setProjectName(firstProjectId);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        if (!projectName) return;

        const response = await axios.get(apiUrl.apiUrl + `/api/project/${projectName}`);
        if (response.data) {
          setProjectImage(response.data.project_image_file);
          setProjectLogo(response.data.logo_file);
          setlocationName(response.data.project_name);
        }


      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    const fetchBlocks = async () => {
      try {
        if (!projectName) return;
        const response = await axios.get(apiUrl.apiUrl + `/api/blocks/${projectName}`);
        setBlocks(response.data);
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };

    // const fetchSections = async () => {

    //   try {
    //     if (!block) return;
    //     const response = await axios.get(apiUrl.apiUrl + `/api/blocks/sections/${block}`);
    //     setSections(response.data);
    //   } catch (error) {
    //     console.error('Error fetching sections:', error);
    //   }
    // };

    const fetchPlots = async () => {
      try {
        if (!block) return;
        // console.log(block);
        const response = await axios.get(apiUrl.apiUrl + `/api/block/plot/${block}`);
        // console.log(response.data);

        setPlots(response.data);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };


    fetchProjectDetails();
    fetchBlocks();
    // fetchSections();
    fetchPlots();

    const handleProjectChange = (projectId) => {
      setProjectName(projectId);
      fetchBlocks(projectId);
    };

    const handleBlockChange = (blockId) => {
      setBlock(blockId);
      fetchPlots(blockId);
    };

    // const handleSectionChange = (sectionId) => {
    //   setSection(sectionId);
    //   fetchPlots(sectionId);
    // };




  }, [projectName, block, section]);

  return (

    <main className='page-content'>

      <SignInModal
        show={showSignInModal}
        onClose={handleClose}
        signIn={signIn}
        setSuccessMessage={setSuccessMessage}
        successMessage={successMessage} 
        onSignInSuccess={handleSignInSuccess}      
      />

      <div className='instant-booking-page-bg'>
        <div className='container-fluid'>
          <div className='row instant-booking-row'>
            <div className='col-md-10'>
              <div className='instant-booking-card'>
                <div className='close-button ' onClick={handleClose}>
                  <div className='close-icon'></div>
                </div>

                <Form>
                  <div className='instant-booking-row row'>
                    <div className='col-md-5'>
                      <div className='instant-booking-img-div'>
                        <img src={imgUrl.imgUrl + `/storage/projects/` + projectImage} className='img-fluid' />
                        <div className='row form-row instant-booking-img-form'>
                          <div className='col-md-4'>
                            <Form.Select
                              className='form-control'
                              aria-label="Projects"
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}>
                              <option value="">Project</option>
                              {Projects.map((project) => (
                                <option key={project.id} value={project.id}>{project.project_name}</option>
                              ))}
                            </Form.Select>
                            {formErrors.projectName && <div className="error-message">{formErrors.projectName}</div>}
                          </div>
                        </div>
                        <div className='project-location-div'>
                          <h3>{locationName}</h3>
                        </div>
                        <div className='instant-booking-form-botttomimg'>
                          <img src={imgUrl.imgUrl + `/storage/projects/` + projectLogo} className='img-fluid' />
                        </div>
                      </div>
                    </div>
                    <div className='col-md-7'>
                      <div className='instant-booking-form-div'>
                        <div className='instant-booking-form-head'>
                          <h4> <img src="https://purvaland.bookmyplotnow.com/assets/images/booking.png" className='img-fluid' /> Instant Booking PLOT</h4>
                        </div>
                        <div className='row form-row'>
                          <div className='col-md-4'>
                            <Form.Select
                              className='form-control'
                              aria-label="Select block"
                              value={block}
                              onChange={(e) => setBlock(e.target.value)}
                            >
                              <option value="">Block</option>
                              {Array.isArray(Blocks) ? (
                                Blocks.map((block) => (
                                  <option key={block.id} value={block.id}>{block.block_name}</option>
                                ))
                              ) : (
                                Object.keys(Blocks).map((key) => (
                                  <option key={Blocks[key].id} value={Blocks[key].id}>{Blocks[key].block_name}</option>
                                ))
                              )}
                            </Form.Select>
                            {formErrors.block && <div className="error-message">{formErrors.block}</div>}
                          </div>

                          {/* <div className='col-md-4'>
                            <Form.Select
                              className='form-control'
                              aria-label="Select section"
                              value={section}
                              onChange={(e) => setSection(e.target.value)}
                            >
                              <option value="">Section</option>
                              {Array.isArray(Sections) ? (
                                Sections.map((section) => (
                                  <option key={section.id} value={section.id}>{section.section}</option>
                                ))
                              ) : (
                                Object.keys(Sections).map((key) => (
                                  <option key={Sections[key].id} value={Sections[key].id}>{Sections[key].section}</option>
                                ))
                              )}

                            </Form.Select>
                            {formErrors.section && <div className="error-message">{formErrors.section}</div>}
                          </div> */}

                          <div className='col-md-4'>
                            <Form.Select
                              className='form-control'
                              aria-label="Select unit"
                              value={unit}
                              onChange={(e) => setUnit(e.target.value)}
                            >
                              <option value="">Unit</option>
                              {Array.isArray(Plots) ? (
                                Plots.map((plot) => (
                                  <option key={plot.id} value={plot.id}>{plot.plot_number}</option>
                                ))
                              ) : (
                                Object.keys(Plots).map((key) => (
                                  <option key={Plots[key].id} value={Plots[key].id}>{Plots[key].plot_number}</option>
                                ))
                              )}
                            </Form.Select>
                            {formErrors.unit && <div className="error-message">{formErrors.unit}</div>}
                          </div>
                        </div>
                        <div className='row btn-row'>
                          <div className='col-md-12'>
                            <Button className='proceed-button' onClick={() => handleProceed(userId)}>Proceed</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

  );
}

export default InstantBooking;
