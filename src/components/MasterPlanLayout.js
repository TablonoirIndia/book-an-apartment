import React, { useContext, useState, useRef, useEffect } from 'react';
import Header from './header';
import { FaArrowLeft } from "react-icons/fa";
import { Modal, Button, Table } from 'react-bootstrap';
import { BrowserRouter as Router, Link, Route, Switch, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';


import SignInModal from './SignInSignUpModal';
import AuthContext from './AuthContext';

import funnel from "../asserts/img/funnel.png";

import FilterComponent from './FilterPage';
import PopupComponent from './PopupComponent';

import * as apiUrl from '../apiUrl';
import * as imgUrl from '../apiUrl';

import IntroModal from '../modals/IntroModal';

import pdfUrl from '../asserts/img/sp-kovil.pdf';

import axios from 'axios';


import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

// Introduction Modal
const steps = [
  { title: 'Process flow', description: `Here's a process flow to show where you are.` },
  { title: 'Interact with Amenities', description: 'Hover or click on the icons to explore amenities in the project' },
  { title: 'Interact with Plots', description: 'Click on the Plots to explore or book the plot' },
];

function MasterPlanLayout() {

  const navigate = useNavigate();

  let { projectId } = useParams();

  const { isSignedIn, signIn, user, signOut } = useContext(AuthContext);
  const [showSignInModal, setShowSignInModal] = useState(!isSignedIn);
  const [signedIn, setSignedIn] = useState(isSignedIn);
  const [successMessage, setSuccessMessage] = useState('');


  const iframeRef = useRef(null);
  const [plotDetails, setPlotDetails] = useState(null);
  const [showPlotModal, setShowPlotModal] = useState(false);

  const [boundingRectangles, setBoundingRectangles] = useState([]);
  const [pdfPath, setPdfPath] = useState('');
  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  // const [error, setError] = useState('');

  const [MasterPlans, setMasterPlans] = useState([]);
  const [Amenities, setAmenities] = useState([]);
  const [Blocks, setBlocks] = useState([]);
  const [Projects, setProjects] = useState([]);

  const [areas, setAreas] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [masterPlanId, setMasterPlanId] = useState(null);
  const [subImagePaths, setSubImagePaths] = useState([]);

  const [hoveredBlockData, setHoveredBlockData] = useState(null);

  const [FilterShow, setFilterShow] = useState(false);
  const FilterhandleClose = () => setFilterShow(false);
  const FilterhandleShow = () => setFilterShow(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filterResult, setFilterResult] = useState(null);


  const [currentStep, setCurrentStep] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(true);


  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: '100%', height: 'auto' });
  const overlayRef = useRef(null);




  useEffect(() => {
    setModalIsOpen(true);
  }, []);





  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const nextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));

  
  const handleApplyFilters = async (filterCriteria) => {

    setLoading(true);
    setError('');

    // Perform API call to backend with filter criteria    
    try {
      const response = await axios.post(apiUrl.apiUrl + `/api/filter/${projectId}`, filterCriteria);
      // Update state with filtered result
      setFilterResult(response.data);
      FilterhandleClose();

    } catch (error) {
      if (error.response && error.response.status === 404) {
        FilterhandleClose();
        setFilterResult([]);
        setError('No data found matching the filter criteria.');
      } else if (error.response && error.response.status === 400) {
        FilterhandleClose();
        setFilterResult([]);
        setError('No filter criteria provided.');
      }
      else {
        setError('An error occurred while fetching data.');
      }
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!projectId) return;

        // Project API Calling
        const projectresponse = await fetch(apiUrl.apiUrl + `/api/project/${projectId}`);
        if (!projectresponse.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const projectdata = await projectresponse.json();
        setProjects(projectdata);      

        // Master Plan API Calling
        const response = await fetch(apiUrl.apiUrl + `/api/master-plan/${projectId}`);
        if (!response.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();        

        // Check if data is an array or an object and contains the id
        if (Array.isArray(data) && data.length > 0) {
          setMasterPlanId(data[0].id);
          setPdfPath(data[0].master_plan_image);
          await fetchAndSetPdfBlob(data[0].master_plan_image);

        } else if (data && data.id) {
          setMasterPlanId(data.id);
          setPdfPath(data.master_plan_image);
          await fetchAndSetPdfBlob(data[0].master_plan_image);


        } else {
          console.error('Master Plan ID not found in the response data');
        }

        setMasterPlans(data);

       

        // Blocks API Calling
        // const Blocksresponse = await fetch(apiUrl.apiUrl + `/api/blocks/${projectId}/${masterPlanId}`);
        // if (!Blocksresponse.ok) { // Check if response is successful
        //   throw new Error('Failed to fetch data');
        // }
        // const Blocksdata = await Blocksresponse.json();

        // console.log(Blocksdata);

        // setBlocks(Blocksdata);

        // Amenities API Calling
        const Amenitiesresponse = await fetch(apiUrl.apiUrl + `/api/amenities/${projectId}`);
        if (!Amenitiesresponse.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const Amenitiesdata = await Amenitiesresponse.json();
        setAmenities(Amenitiesdata);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [projectId]);

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!projectId || !masterPlanId) return;
  
      try {
        const Blocksresponse = await fetch(apiUrl.apiUrl + `/api/blocks/${projectId}/${masterPlanId}`);
        if (!Blocksresponse.ok) {
          throw new Error('Failed to fetch blocks data');
        }
        const Blocksdata = await Blocksresponse.json();
        setBlocks(Blocksdata);
       
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };
  
    fetchBlocks();
  }, [projectId, masterPlanId]);


  const fetchAndSetPdfBlob = async (pdfPath) => {
    try {
      const response = await fetch(`${apiUrl.apiUrl}/api/get-pdf/${pdfPath}`, { method: 'GET' });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      setPdfBlob(blob);

    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };



  const [showModal, setShowModal] = useState(null);

  const handleClose = () => setShowModal(null);
  const handleShow = (amenityId) => setShowModal(amenityId);


  // useEffect(() => {
  //   // Fetch master plan data from the API
  //   const fetchMasterPlanData = async () => {
  //     try {
  //       const response = await axios.get(`${apiUrl.apiUrl}/api/masterplan/coordinates/${projectId}/${masterPlanId}`);
  //       const data = response.data; 

  //       if (!data || !Array.isArray(data) || data.length === 0) {
  //         setError('No data found.');
  //         return;
  //       }

  //       const coordinatesArray = data.map(item => {
  //         const webmapping = item.webmapping;
  //         if (!webmapping) return null;
  //         const coordinates = webmapping.split(',').map(Number);

  //         return {
  //           plot_number: item.plot_number,
  //           coordinates
  //         };
  //       }).filter(item => item !== null);

  //       if (coordinatesArray.length === 0) {
  //         setError('No valid coordinates found.');
  //         return;
  //       }

  //       setBoundingRectangles(coordinatesArray);
  //     } catch (error) {
  //       console.error('Error fetching master plan data:', error);
  //       setError('Failed to fetch master plan data.');
  //     }
  //   };

  //   fetchMasterPlanData();
  // }, [projectId, masterPlanId]);

  // const fetchPlotDetails = async (PlotNumber) => {
  //   try {
  //     const response = await axios.get(`${apiUrl.apiUrl}/api/plot-details/${projectId}/${masterPlanId}/${PlotNumber}`);
  //     // setPlotDetails(response.data.plots);
  //     // setShowPlotModal(true);
  //     if (response.data && response.data.plots && response.data.plots.length > 0) {
  //       setPlotDetails(response.data.plots[0]);  // Access the first element of the array
  //       setShowPlotModal(true);
  //     } else {
  //       console.error('Plot details not found in response:', response.data);
  //       setError('Failed to fetch plot details.');
  //     }

  //   } catch (error) {
  //     console.error('Error fetching plot details:', error);
  //     setError('Failed to fetch plot details.');
  //   }
  // };

  // const renderBoundingRectangles = (viewport) => {
  //   return boundingRectangles.map(({ plot_number, coordinates }, index) => {
  //     const [x1, y1, x2, y2] = coordinates;

  //     const rectWidth = x2 - x1;
  //     const rectHeight = y2 - y1;

  //     // Adjust the coordinates based on the PDF viewport scale and position
  //     const adjustedX = x1 * viewport.scale;
  //     const adjustedY = viewport.height - y1 * viewport.scale - rectHeight * viewport.scale;

  //     return (
  //       <div
  //         key={index}
  //         style={{
  //           position: 'absolute',
  //           left: adjustedX,
  //           top: adjustedY,
  //           width: rectWidth * viewport.scale,
  //           height: rectHeight * viewport.scale,
  //           border: '2px solid red', // Customize the style as needed
  //           pointerEvents: 'none',
  //         }}
  //       >
  //         <span style={{ color: 'white', background: 'black', padding: '2px' }}>{plot_number}</span>
  //       </div>
  //     );
  //   });
  // };

  // const handleHover = async (project_id, masterPlanId, block_id) => {    
  //   try {
  //     const response = await fetch(apiUrl.apiUrl + `/api/blocks/plot-count/${project_id}/${masterPlanId}/${block_id}`);
  //     // console.log(response);

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch data');
  //     }
  //     const data = await response.json();
  //     setHoveredBlockData(data); // Update state with fetched data
  //     // console.log(data);

  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  const handleHover = async (project_id, masterPlanId, block_id) => {    
    try {
      const response = await fetch(`${apiUrl.apiUrl}/api/blocks/plot-count/${project_id}/${masterPlanId}/${block_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setHoveredBlockData(data); // Store the fetched data
  
      // Now fetch the coordinates for the hovered block
      const coordinatesResponse = await axios.get(`${apiUrl.apiUrl}/api/masterplan/coordinates/${project_id}/${masterPlanId}/${block_id}`);
      const coordinatesData = coordinatesResponse.data;
      // console.log(coordinatesData);

  
      if (coordinatesData && Array.isArray(coordinatesData) && coordinatesData.length > 0) {
        const coordinatesArray = coordinatesData.map(item => {
          const webmapping = item.webmapping;
          if (!webmapping) return null;
          const coordinates = webmapping.split(',').map(Number);
  
          return {
            block: item.block,
            coordinates
          };
        }).filter(item => item !== null);

        console.log(coordinatesArray);
  
        setBoundingRectangles(coordinatesArray); // Set the coordinates on hover
      } else {
        setBoundingRectangles([]); // Clear if no coordinates found
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setBoundingRectangles([]); // Clear bounding rectangles if error
    }
  };
  


  // const handleOverlayClick = (event) => {
  //   const iframe = iframeRef.current;
  //   const rect = iframe.getBoundingClientRect();
  //   const x = event.clientX - rect.left;
  //   const y = event.clientY - rect.top;

  //   // Fetch all span elements within the text layer
  //   const plotSpans = document.querySelectorAll('.rpv-core__text-layer .rpv-core__text-layer-text');
  //   let closestPlot = null;
  //   let minDistance = Infinity;

  //   plotSpans.forEach((plotSpan) => {
  //     const spanRect = plotSpan.getBoundingClientRect();
  //     const spanX = spanRect.left - rect.left;
  //     const spanY = spanRect.top - rect.top;

  //     // Calculate the distance between the click position and the span's position
  //     const distance = Math.sqrt(Math.pow(x - spanX, 2) + Math.pow(y - spanY, 2));

  //     // Check if this span is the closest one to the click
  //     if (distance < minDistance) {
  //       minDistance = distance;
  //       closestPlot = plotSpan;
  //     }
  //   });

  //   if (closestPlot) {
  //     const plotNumber = closestPlot.innerText.trim();

  //     // Ensure the clicked span contains a valid number
  //     if (!isNaN(plotNumber) && plotNumber.length > 0) {
  //       fetchPlotDetails(plotNumber); // Fetch and display plot details
  //     }
  //   } else {
  //     console.log('No plot number found near the clicked position.');
  //   }
  // };

  // const renderPlotDetails = () => {
  //   if (!plotDetails) return null;

  //   // Assuming plotDetails is an object with key-value pairs representing titles and data
  //   return (

  //     <Table striped bordered hover>
  //       <tbody>
  //         <tr>
  //           <td>Plot Number </td>
  //           <td>{plotDetails.plot_number}</td>
  //         </tr>
  //         <tr>
  //           <td>Plot Size</td>
  //           <td>{plotDetails.plot_size} sqft</td>
  //         </tr>
  //         <tr>
  //           <td>Plot Type</td>
  //           <td>{plotDetails.plot_type}</td>
  //         </tr>
  //         <tr>
  //           <td>Price</td>
  //           <td>Rs. {plotDetails.actual_price}</td>
  //         </tr>
  //         <tr>
  //           <td>Direction</td>
  //           <td>{plotDetails.direction}</td>
  //         </tr>
  //         <tr>
  //           <td>Status</td>
  //           <td>{plotDetails.status}</td>
  //         </tr>
  //       </tbody>
  //     </Table>
  //   );
  // };



  return (

    <main className='page-content'>
      <Header />

      <div>
        <IntroModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          content={steps[currentStep]}
          onNext={nextStep}
          onPrev={prevStep}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>

      {Amenities.map((amenity) => (
        <Modal
          key={amenity.id}
          show={showModal === amenity.id}
          onHide={handleClose}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          size="lg"
        >
          <Modal.Header>
            <div className='close-button' onClick={handleClose}>
              <div className='close-icon'></div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className='amenities-img-div'>
              <img src={imgUrl.imgUrl + `/storage/amenities/${amenity.amenity_image}`} className='img-fluid' alt={amenity.amenity_name} />
            </div>
          </Modal.Body>
        </Modal>
      ))}


      <div className='flex-wrap common-top-spacing'>
        <div className='amenities-div'>
          <div className='sidebar-left-title'>
            <h4>Amenities</h4>
          </div>
          <div className='amenities-icons-div'>
            <ul>
              {Amenities.map((amenity) => (
                <li key={amenity.id}>
                  <span className='side-nav-icon'
                    style={{ backgroundImage: `url(${imgUrl.imgUrl}/storage/amenities/icons/${amenity.amenity_icon})` }}
                    onClick={() => handleShow(amenity.id)}></span>
                </li>
              ))}
            </ul>
          </div>

          <div className='block-div block-mobile-div'>
          <div className='sidebar-left-title'>
            <h4>Phase</h4>
          </div>
          <div className='scroll-bar-block-list'>
            <div className='amenities-icons-div'>
              <ul>
                {Blocks.map((block) => (
                  <li key={block.id} onMouseEnter={() => handleHover(block.project_id, block.master_plan_id, block.id )}>
                    {block.available_plot_count > 0 ? (
                      <span className='side-nav-icon' onClick={() => navigate(`/block/${block.project_id}/${block.master_plan_id}/${block.id}`)}>
                        <p id={block.id}>{block.block_name}</p>
                      </span>
                    ) : (
                      <span className='side-nav-icon red-color'>
                        <p id={block.id}>{block.block_name}</p>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

          <div className='filter-icon' onClick={FilterhandleShow}>
            <img src={funnel} className='img-fluid' />
          </div>

        </div>

        <div className='block-img-div'>
          <div className='block-img'>
            <div className='popover-box popover-right'>
              <a href="#"> <FaArrowLeft /> Back</a>
            </div>
            {hoveredBlockData && (
              <div className='img-overlay-top top-right'>
                <p className='block-name'>Phase {hoveredBlockData.block.block_name}</p>
                <div className='available-plots-div'>
                  <p className='available-plot'>Available Plots</p>
                  <p className='available-plot-number'>{hoveredBlockData.block.total_available_plot_count}</p>
                </div>
              </div>
            )}     

            <div className='canvas-div'>
              {/* {pdfBlob && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
                    <Viewer
                      fileUrl={URL.createObjectURL(pdfBlob)}
                      renderMode="canvas"
                      withCredentials={false}                      
                    />                    
                  </div>
                </Worker>
              )} */}
{/* 
            {pdfBlob && (
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
                      <Viewer
                        fileUrl={URL.createObjectURL(pdfBlob)}
                        renderMode="canvas"
                        withCredentials={false}
                      /> */}
                      
                      {/* Render the overlay when block is hovered */}
                      {/* {hoveredBlockData && renderBlockOverlay(hoveredBlockData)} */}
                    {/* </div>
                  </Worker>
                )} */}

                {/* {pdfBlob && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
            <Viewer
              fileUrl={URL.createObjectURL(pdfBlob)}
              renderMode="canvas"
              withCredentials={false}
            /> */}
            {/* Render overlay rectangles only when hovered */}
            {/* <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {boundingRectangles.map((rect, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${rect.coordinates[0]}px`,
                    top: `${rect.coordinates[1]}px`,
                    width: `${rect.coordinates[2] - rect.coordinates[0]}px`,
                    height: `${rect.coordinates[3] - rect.coordinates[1]}px`,
                    border: '2px solid black',
                    pointerEvents: 'none',
                    background: 'green',
                    opacity:'0.5',
                    
                  }}
                />
              ))}
            </div>
          </div>
        </Worker>
      )} */}

{pdfBlob && (
  <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
      <Viewer
        fileUrl={URL.createObjectURL(pdfBlob)}
        renderMode="canvas"
        withCredentials={false}
      />
      
      {/* Render overlay rectangle only for the hovered block */}
      {boundingRectangles.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {boundingRectangles.map((rect, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${rect.coordinates[0]}px`,
                top: `${rect.coordinates[1]}px`,
                width: `100px`,
                height: `100px`,
                border: '2px solid black',
                pointerEvents: 'none',
                background: 'green',
                opacity: '0.5',
              }}
            />
          ))}
        </div>
      )}
    </div>
  </Worker>
)}



              {/* <Modal show={showPlotModal} onHide={() => setShowPlotModal(false)}>
                <Modal.Header>
                  <Modal.Title>Plot Details</Modal.Title>
                  <div className='close-button' onClick={() => setShowPlotModal(false)}>
                    <div className='close-icon'></div>
                  </div>
                </Modal.Header>
                <Modal.Body>
                  {renderPlotDetails()}
                </Modal.Body>
                <Modal.Footer>
                 
                  <Button variant="primary" onClick={() => navigate(`/booking/${plotDetails.project_id}/${plotDetails.id}/2`)}>Book</Button>
                  <Button variant="secondary" onClick={() => setShowPlotModal(false)}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal> */}
            </div>

          </div>
        </div>
        <div className='block-div block-large-div'>
          <div className='sidebar-left-title'>
            <h4>Phase</h4>
          </div>
          <div className='scroll-bar-block-list'>
            <div className='amenities-icons-div'>
              <ul>
              {Blocks.map((block) => (
                  <li key={block.id} onMouseEnter={() => handleHover(block.project_id, block.master_plan_id, block.id )}>
                    {block.available_plot_count > 0 ? (
                      <span className='side-nav-icon' onClick={() => navigate(`/block/${block.project_id}/${block.master_plan_id}/${block.id}`)}>
                        <p id={block.id}>{block.block_name}</p>
                      </span>
                    ) : (
                      <span className='side-nav-icon red-color'>
                        <p id={block.id}>{block.block_name}</p>
                      </span>
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

      <Modal className="filter-popup" show={FilterShow} size='lg' onHide={FilterhandleClose} aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Body>
          <div className='close-button ' onClick={FilterhandleClose}>
            <div className='close-icon'></div>
          </div>
          <FilterComponent onApplyFilters={handleApplyFilters} />
        </Modal.Body>
      </Modal>

      <div>
        {filterResult && <PopupComponent data={filterResult} error={error} />}
        {loading && <p>Loading...</p>}
      </div>

    </main>
  );
}

export default MasterPlanLayout;
