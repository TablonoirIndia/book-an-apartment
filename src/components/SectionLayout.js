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

import AuthContext from './AuthContext';

import UserDetailModal from './UserDetailModal';

import * as apiUrl from '../apiUrl';
import * as imgUrl from '../apiUrl';

import IntroModal from '../modals/IntroModal';

// Introduction Modal
const steps = [
  { title: 'Interact with Plots', description: ` Hover or Click on the icons to explore the availability and specification ` },  
];


function SectionLayout() {

  const { isSignedIn, signIn, user } = useContext(AuthContext);

  const navigate = useNavigate();

  let { projectId, blockId, sectionId } = useParams();

  const [Plots, setPlots] = useState([]);
  const [Projects, setProjects] = useState([]);

  const [hoveredBlockData, setHoveredBlockData] = useState(null);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  

  const handleShowUserDetailModal = () => {
    setShowUserDetailModal(true);
  };

  const handleCloseUserDetailModal = () => {
      setShowUserDetailModal(false);
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(true);  

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const nextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));

  useEffect(() => {
    const fetchData = async (project_id, block_id, section_id) => {
      try {
        if (!projectId && !blockId && !sectionId) return;

        // Project API Calling
        const projectresponse = await fetch(apiUrl.apiUrl + `/api/project/${projectId}`);
        if (!projectresponse.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const projectdata = await projectresponse.json();
        setProjects(projectdata);
        // console.log(projectdata);

        // Plot API Calling
        const Plotresponse = await fetch(apiUrl.apiUrl + `/api/plot-details/plot/${project_id}/${block_id}/${section_id}`);

        if (!Plotresponse.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const Plotsdata = await Plotresponse.json();
        setPlots(Plotsdata);
        // console.log(Plotsdata);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(projectId, blockId, sectionId);
  }, [projectId, blockId, sectionId]);


  const handleHover = async (project_id, block_id, section_id, plot_id) => {
    try {
      const response = await fetch(apiUrl.apiUrl + `/api/plot-details/detail/${project_id}/${block_id}/${section_id}/${plot_id}`);
      // console.log(response);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setHoveredBlockData(data); // Update state with fetched data
      // console.log(data);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  return (

    <main className='page-content'>
      <Header />

      {isSignedIn && (
          <>        
          <IntroModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            content={steps[currentStep]}
            onNext={nextStep}
            onPrev={prevStep}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
          />
        </>
        )}
    
      {isSignedIn && (
        <div className='flex-wrap common-top-spacing'>
          <div className='amenities-div'>
            <div className='sidebar-left-title'>
              <h4>Plot</h4>
            </div>
          </div>

          <div className='block-div block-mobile-div'>
            <div className='user-name'>
              <p>{user.name} </p>
            </div>
            <div className='user-icon' 
              onClick={handleShowUserDetailModal}>             
              <FaRegUserCircle />
            </div>
            <UserDetailModal                
                show={showUserDetailModal}
                onClose={handleCloseUserDetailModal}
            />

            <div className='scroll-bar-block-list'>
              <div className='amenities-icons-div'>
                <ul>
                  {Plots && Plots.plots && Plots.plots.map((plot) => (
                    <li key={plot.id} onMouseEnter={() => handleHover(plot.project_id, plot.block_id, plot.section_id, plot.id)}>
                      {plot.status === 'Available' ? (
                        <span className='side-nav-icon' onClick={() => navigate(`/selected-plot/${plot.project_id}/${plot.block_id}/${plot.section_id}/${plot.id}`)}>
                          <p>{plot.plot_number}</p>
                        </span>
                      ) : plot.status === 'Not Available' ? (
                        <span className='side-nav-icon red-color'>
                          <p>{plot.plot_number}</p>
                        </span>
                      ) : plot.status === 'Pre-Booked' ? (
                        <span className='side-nav-icon orange-color'>
                          <p>{plot.plot_number}</p>
                        </span>
                      ) : (
                        null
                      )}
                    </li>
                  ))}

                </ul>
              </div>
            </div>
          </div>

          <div className='block-img-div '>
            <div className='block-img section-bg-img'>
              <div className='popover-box popover-right'>
                <a href="#"> <FaArrowLeft /> Back</a>
                <a href="#" className='home-icon'> <FaHome /></a>
              </div>

              {Plots && Plots.blocks && Plots.blocks.map((block) => (
                <div className='block-list-left' key={block.id}>
                  <span className='block-list-div'>Block {block.block_name}</span> - {" "}
                  {Plots && Plots.sections && Plots.sections.map((section) => (
                    <span className='block-list-div' key={section.id}>
                      Section {section.section}
                    </span>
                  ))}
                </div>
              ))}

              <div className='select-plot-center'>
                <p className='block-list-div'>Select Your Plot</p>
                <div className="arrows"></div>
              </div>

              {hoveredBlockData && (
                <div className='img-overlay-top top-right'>
                  {hoveredBlockData.plots.status == "Available" ? (
                    <p className='plot-name green-color'>{hoveredBlockData.plots.status}</p>
                  ) : hoveredBlockData.plots.status === 'Not Available' ? (
                    <p className='plot-name red-color'>{hoveredBlockData.plots.status}</p>
                  ) : hoveredBlockData.plots.status === 'Pre-Booked' ? (
                    <p className='plot-name orange-color'>{hoveredBlockData.plots.status}</p>
                  ) : (
                    null
                  )
                  }


                  <div className='row available-plots-div available-plots-row'>
                    <div className='col-md-6 border-right-green'>
                      <div className='plot-size'>
                        <h6>Plot Size</h6>
                        <p>{hoveredBlockData.plots.plot_size}</p>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='plot-type'>
                        <h6>Type</h6>
                        <p>{hoveredBlockData.plots.plot_type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {Plots && Plots.sections && Plots.sections.map((section) => (
                <img src={imgUrl.imgUrl + `/storage/sections/${section.section_image}`} className='img-fluid' alt={section.section} />
              ))}

            </div>
          </div>
          <div className='block-div block-large-div'>
            <div className='user-name'>
              <p>{user.name} </p>
            </div>
            <div className='user-icon' 
            onClick={handleShowUserDetailModal}>             
              <FaRegUserCircle />
            </div>
            <UserDetailModal                
                show={showUserDetailModal}
                onClose={handleCloseUserDetailModal}
            />
            <div className='scroll-bar-block-list'>
              <div className='amenities-icons-div'>
                <ul>

                  {Plots && Plots.plots && Plots.plots.map((plot) => (
                    <li key={plot.id} onMouseEnter={() => handleHover(plot.project_id, plot.block_id, plot.section_id, plot.id)}>
                      {plot.status === 'Available' ? (
                        <span className='side-nav-icon' onClick={() => navigate(`/selected-plot/${plot.project_id}/${plot.block_id}/${plot.section_id}/${plot.id}`)}>
                          <p>{plot.plot_number}</p>
                        </span>
                      ) : plot.status === 'Not Available' ? (
                        <span className='side-nav-icon red-color'>
                          <p>{plot.plot_number}</p>
                        </span>
                      ) : plot.status === 'Pre-Booked' ? (
                        <span className='side-nav-icon orange-color'>
                          <p>{plot.plot_number}</p>
                        </span>
                      ) : (
                        null
                      )}
                    </li>
                  ))}

                </ul>
              </div>
            </div>
          </div>
          <div className='project-logo'>
            <img src={imgUrl.imgUrl + `/storage/projects/${Projects.logo_file}`} className='img-fluid' alt={Projects.project_name} />
          </div>
        </div>
      )}
    </main>

  );
}

export default SectionLayout;
