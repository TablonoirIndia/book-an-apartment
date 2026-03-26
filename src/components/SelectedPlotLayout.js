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

import SelectedPlotImg from "../asserts/img/19.jpg";
import logo from "../asserts/img/logo.jpg";

import * as apiUrl from '../apiUrl';
import * as imgUrl from '../apiUrl';

import IntroModal from '../modals/IntroModal';

// Introduction Modal
const steps = [
    { title: 'Interact with Plots', description: `  Hover or click to visualize the measurements of each Plots  ` },
    { title: 'Proceed to Booking', description: `  Click to see more details about the unit and book it online  ` },  
];

function SelectedPlotLayout() {

    const { isSignedIn, signIn, user } = useContext(AuthContext);

    const navigate = useNavigate();

    let { projectId, blockId, sectionId, plotId } = useParams();

    const [SelectedPlots, setSelectedPlots] = useState([]);

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
        const fetchData = async (project_id, block_id, section_id, plot_id) => {
            try {
                if (!projectId && !blockId && !sectionId && !plotId) return;

                // Plot API Calling
                const Plotresponse = await fetch(apiUrl.apiUrl + `/api/plot-details/detail/${project_id}/${block_id}/${section_id}/${plot_id}`);

                if (!Plotresponse.ok) { // Check if response is successful
                    throw new Error('Failed to fetch data');
                }
                const Plotsdata = await Plotresponse.json();
                setSelectedPlots(Plotsdata);
                // console.log(Plotsdata);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(projectId, blockId, sectionId, plotId);
    }, [projectId, blockId, sectionId, plotId]);




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
                        <h4>Plot Area</h4>
                    </div>
                </div>
                <div className='block-div block-mobile-div'>
                    <div className='user-name'>
                        <p>{user.name} </p>
                    </div>
                    <div className='user-icon' 
                    onClick={handleShowUserDetailModal}
                    >
                        <FaRegUserCircle />
                    </div>
                    <UserDetailModal                
                    show={showUserDetailModal}
                    onClose={handleCloseUserDetailModal}
                    />
                </div>

                <div className='block-img-div '>
                    <div className='block-img section-bg-img'>
                        <div className='popover-box popover-right'>
                            <a href="#"> <FaArrowLeft /> Back</a>
                            <a href="#" className='home-icon'> <FaHome /></a>
                        </div>
                        {SelectedPlots && SelectedPlots.plots && (
                            <img src={imgUrl.imgUrl + `/storage/plots/${SelectedPlots.plots.plot_image}`} className='img-fluid' alt={SelectedPlots.plots.plot_number} />
                        )}
                    </div>
                </div>
                <div className='block-div block-large-div'>
                    <div className='user-name'>
                        <p>{user.name} </p>
                    </div>
                    <div className='user-icon'
                    onClick={handleShowUserDetailModal}
                    >
                      <FaRegUserCircle />
                    </div>
                    <UserDetailModal                
                    show={showUserDetailModal}
                    onClose={handleCloseUserDetailModal}
                    />
                </div>
                <div className='project-logo'>
                    {SelectedPlots && SelectedPlots.projects && (
                        <img src={imgUrl.imgUrl + `/storage/projects/${SelectedPlots.projects.logo_file}`} className='img-fluid' alt={SelectedPlots.projects.project_name} />
                    )}
                </div>
                <div className='booking-btn-div'>
                    {SelectedPlots && SelectedPlots.plots && (
                        <Button className='booking-btn' title="Proceed to Booking" onClick={() => navigate(`/booking/${SelectedPlots.projects.id}/${SelectedPlots.plots.id}/${user.id}`)}>
                            See Details & Book
                        </Button>
                    )}
                </div>
            </div>
            )}
        </main>

    );


}
export default SelectedPlotLayout;