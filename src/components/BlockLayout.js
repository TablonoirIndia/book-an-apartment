import Header from './header';
import { FaArrowLeft } from "react-icons/fa";
import React, { useContext, useState, useRef, useEffect } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
// import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal';
import { FaRegWindowClose } from "react-icons/fa";
import Form from 'react-bootstrap/Form';
import { BrowserRouter as Router, Link, Route, Switch, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Table } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import SignInModal from './SignInSignUpModal';
import AuthContext from './AuthContext';

import UserDetailModal from './UserDetailModal';


import funnel from "../asserts/img/funnel.png";
import FilterComponent from './FilterPage';
import PopupComponent from './PopupComponent';

import * as apiUrl from '../apiUrl';
import * as imgUrl from '../apiUrl';

import IntroModal from '../modals/IntroModal';

import axios from 'axios';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

// Introduction Modal
const steps = [
  { title: 'Interact with Plots', description: ` Hover or Click on the icons to explore the availability and specification ` },
];

function BlockLayout() {

  const { isSignedIn, signIn, user, signOut } = useContext(AuthContext);
  const [showSignInModal, setShowSignInModal] = useState(!isSignedIn);
  const [signedIn, setSignedIn] = useState(isSignedIn);
  const [successMessage, setSuccessMessage] = useState('');

  const [showUserDetailModal, setShowUserDetailModal] = useState(false);


  const handleShowUserDetailModal = () => {
    setShowUserDetailModal(true);
  };

  const handleCloseUserDetailModal = () => {
    setShowUserDetailModal(false);
  };

  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(true);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const nextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));

  const iframeRef = useRef(null);
  const [plotDetails, setPlotDetails] = useState(null);
  const [showPlotModal, setShowPlotModal] = useState(false);

  const [plotData, setPlotData] = useState([]);

  const [boundingRectangles, setBoundingRectangles] = useState([]);
  const [pdfPath, setPdfPath] = useState('');
  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [viewport, setViewport] = useState(null);

  useEffect(() => {
    setShowSignInModal(!isSignedIn);
  }, [isSignedIn]);

  const handleClose = () => {
    if (!isSignedIn) {
      setShowSignInModal(true);
      setModalIsOpen(false);
    } else {
      setShowSignInModal(false);
      setModalIsOpen(true);
    }
  };

  const handleSignInSuccess = (userId) => {
    // console.log (userId);
    if (userId) {
      console.log(userId);
      //   setUserId(userId);
      //   setShowSignInModal(false);

    }
  };


  let { projectId, masterPlanId, blockId } = useParams();
  const [Blocks, setBlocks] = useState([]);
  const [Projects, setProjects] = useState([]);

  const [hoveredBlockData, setHoveredBlockData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [FilterShow, setFilterShow] = useState(false);
  const FilterhandleClose = () => setFilterShow(false);
  const FilterhandleShow = () => setFilterShow(true);
  const [filterResult, setFilterResult] = useState(null);

  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: '100%', height: 'auto' });
  const overlayRef = useRef(null);

  const [fileUrl, setFileUrl] = useState(null);

  const handleApplyFilters = async (filterCriteria) => {

    setLoading(true);
    setError('');

    // Perform API call to backend with filter criteria    
    try {
      const response = await axios.post(apiUrl.apiUrl + `/api/filter-data/${projectId}/${blockId}`, filterCriteria);
      // Handle successful response      
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
    const fetchData = async (block_id, masterPlanId, project_id) => {
      try {
        if (!projectId && !masterPlanId && !blockId) return;

        // Project API Calling
        const projectresponse = await fetch(apiUrl.apiUrl + `/api/project/${projectId}`);
        if (!projectresponse.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const projectdata = await projectresponse.json();
        setProjects(projectdata);
        // console.log(projectdata);

        // Blocks API Calling
        const Blocksresponse = await fetch(apiUrl.apiUrl + `/api/blocks/${project_id}/${masterPlanId}/${block_id}`);
        if (!Blocksresponse.ok) { // Check if response is successful
          throw new Error('Failed to fetch data');
        }
        const Blocksdata = await Blocksresponse.json();

        setBlocks(Blocksdata);
        setPdfPath(Blocksdata[0].block_image);
        await fetchAndSetPdfBlob(Blocksdata[0].block_image);

        const Plotdataresponse = await fetch(apiUrl.apiUrl + `/api/plotdetails/plot/${project_id}/${masterPlanId}/${block_id}`);
        if (!Plotdataresponse.ok) {
          throw new Error('Failed to fetch data');
        }
        const plotalldata = await Plotdataresponse.json();      

        setPlotData(plotalldata.plots); // Set the plots array to state     
        applyOverlayColors();

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(blockId, masterPlanId, projectId);
  }, [projectId, masterPlanId, blockId]);

  // const fetchAndSetPdfBlob = async (pdfPath) => {
  //   try {
  //     const response = await fetch(`${apiUrl.apiUrl}/api/block-pdf/${pdfPath}`, { method: 'GET' });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch PDF');
  //     }
  //     const blob = await response.blob();
  //     setPdfBlob(blob);

  //   } catch (error) {
  //     console.error('Error fetching PDF:', error);
  //   }
  // };



  const fetchAndSetPdfBlob = async (pdfPath) => {
    try {
      if (!pdfPath) {
        throw new Error('PDF path is not defined');
      }

      const response = await fetch(`${apiUrl.apiUrl}/api/block-pdf/${encodeURIComponent(pdfPath)}`, {
        method: 'GET',
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }

      // Check the content type
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const blob = await response.blob();
      setPdfBlob(blob);
      // console.log('PDF Blob fetched and set successfully');
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };




  // const handleHover = async (project_id, block_id, section_id) => {
  //   try {
  //     const response = await fetch(apiUrl.apiUrl + `/api/sections/count/${project_id}/${block_id}/${section_id}`);
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

  useEffect(() => {
    // Fetch master plan data from the API
    const fetchMasterPlanData = async () => {
      try {
        const response = await axios.get(`${apiUrl.apiUrl}/api/blocks/coordinates/${projectId}/${masterPlanId}/${blockId}`);
        const data = response.data;

        if (!data || !Array.isArray(data) || data.length === 0) {
          setError('No data found.');
          return;
        }

        const coordinatesArray = data.map(item => {
          const webmapping = item.webmapping;
          if (!webmapping) return null;
          const coordinates = webmapping.split(',').map(Number);

          return {
            plot_number: item.plot_number,
            coordinates
          };
        }).filter(item => item !== null);

        if (coordinatesArray.length === 0) {
          setError('No valid coordinates found.');
          return;
        }

        setBoundingRectangles(coordinatesArray);
      } catch (error) {
        console.error('Error fetching master plan data:', error);
        setError('Failed to fetch master plan data.');
      }
    };

    fetchMasterPlanData();
  }, [projectId, masterPlanId]);

  const fetchPlotDetails = async (PlotNumber) => {
    try {
      const response = await axios.get(`${apiUrl.apiUrl}/api/plot-details/${projectId}/${masterPlanId}/${blockId}/${PlotNumber}`);
      // setPlotDetails(response.data.plots);
      // setShowPlotModal(true);
      if (response.data && response.data.plots && response.data.plots.length > 0) {
        setPlotDetails(response.data.plots[0]);  // Access the first element of the array
        setShowPlotModal(true);
      } else {
        console.error('Plot details not found in response:', response.data);
        setError('Failed to fetch plot details.');
      }

    } catch (error) {
      console.error('Error fetching plot details:', error);
      setError('Failed to fetch plot details.');
    }
  };

  const renderBoundingRectangles = (viewport) => {
    return boundingRectangles.map(({ plot_number, coordinates }, index) => {
      const [x1, y1, x2, y2] = coordinates;

      const rectWidth = x2 - x1;
      const rectHeight = y2 - y1;

      // Adjust the coordinates based on the PDF viewport scale and position
      const adjustedX = x1 * viewport.scale;
      const adjustedY = viewport.height - y1 * viewport.scale - rectHeight * viewport.scale;

      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: adjustedX,
            top: adjustedY,
            width: rectWidth * viewport.scale,
            height: rectHeight * viewport.scale,
            border: '2px solid red', // Customize the style as needed
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: 'white', background: 'black', padding: '2px' }}>{plot_number}</span>
        </div>
      );
    });
  };

  

// Function to apply overlay colors to plot spans based on availability
const applyOverlayColors = () => {  
  const plotSpans = document.querySelectorAll('.rpv-core__text-layer .rpv-core__text-layer-text');      

  if (plotSpans.length === 0) {
    console.log('No plot spans found.');
    return; // No spans found, exit early
  }

  plotSpans.forEach((plotSpan) => {
    const plotNumber = plotSpan.innerText.trim();

    // Find the plot's status from plotData
    const plot = plotData.find(p => p.plot_number === plotNumber);

    if (plot) {
      const color = plot.status === 'Available' ? 'green' : 'red';
      plotSpan.style.border = `5px solid ${color}`;
      plotSpan.style.backgroundColor = color;
      plotSpan.style.boxShadow = `0 0 10px ${color}`;
      plotSpan.style.margin= `-0.7rem`;
      plotSpan.style.padding= `0.5rem`;
    }
  }); 
};

// Ensure this function is triggered after PDF is fully rendered
useEffect(() => {
if (plotData.length > 0) {
  applyOverlayColors();
}
}, [plotData]);



  const handleOverlayClick = (event) => {
    const iframe = iframeRef.current;
    const rect = iframe.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Fetch all span elements within the text layer
    const plotSpans = document.querySelectorAll('.rpv-core__text-layer .rpv-core__text-layer-text');
    let closestPlot = null;
    let minDistance = Infinity;

    plotSpans.forEach((plotSpan) => {
      const spanRect = plotSpan.getBoundingClientRect();
      const spanX = spanRect.left - rect.left;
      const spanY = spanRect.top - rect.top;

      // Calculate the distance between the click position and the span's position
      const distance = Math.sqrt(Math.pow(x - spanX, 2) + Math.pow(y - spanY, 2));

      // Check if this span is the closest one to the click
      if (distance < minDistance) {
        minDistance = distance;
        closestPlot = plotSpan;
      }
    });

    if (closestPlot) {
      const plotNumber = closestPlot.innerText.trim();

      // console.log(plotNumber);

      // Ensure the clicked span contains a valid number
      if (!isNaN(plotNumber) && plotNumber.length > 0) {
        // Find the plot's status from plotData
      const plot = plotData.find(p => p.plot_number === plotNumber);

        if (plot.status === 'Available') {     
          fetchPlotDetails(plotNumber); // Fetch and display plot details
        }
      }
    } else {
      console.log('No plot number found near the clicked position.');
    }
  };

  const renderPlotDetails = () => {
    if (!plotDetails) return null;

    if (plotDetails.status == "Not Available") {
      // Assuming plotDetails is an object with key-value pairs representing titles and data
      return (

        <Table striped bordered hover>
          <tbody>
            <tr>
              <td>Plot Number </td>
              <td>{plotDetails.plot_number}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>{plotDetails.status}</td>
            </tr>
          </tbody>
        </Table>
      );
    } else {
      // Assuming plotDetails is an object with key-value pairs representing titles and data
      return (

        <Table striped bordered hover>
          <tbody>
            <tr>
              <td>Plot Number </td>
              <td>{plotDetails.plot_number}</td>
            </tr>
            <tr>
              <td>Plot Size</td>
              <td>{plotDetails.plot_size} sqft</td>
            </tr>
            <tr>
              <td>Plot Type</td>
              <td>{plotDetails.plot_type}</td>
            </tr>
            <tr>
              <td>Price</td>
              <td>Rs. {plotDetails.actual_price}</td>
            </tr>
            <tr>
              <td>Direction</td>
              <td>{plotDetails.direction}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>{plotDetails.status}</td>
            </tr>
          </tbody>
        </Table>
      );
    }
  };

  useEffect(() => {
    if (isSignedIn && pdfPath) {
      fetchAndSetPdfBlob(pdfPath);
    }
  }, [isSignedIn, pdfPath]);

  // useEffect(() => {
  //   const storedPdfPath = localStorage.getItem('pdfPath');
  //   if (storedPdfPath) {
  //       setPdfPath(storedPdfPath);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (isSignedIn && pdfPath) {
  //       localStorage.setItem('pdfPath', pdfPath);
  //       fetchAndSetPdfBlob(pdfPath);
  //   }
  // }, [isSignedIn, pdfPath]);


  useEffect(() => {
    if (pdfBlob) {
      const objectUrl = URL.createObjectURL(pdfBlob);
      setFileUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [pdfBlob]);

  // console.log('File URL:', fileUrl);

  if (!pdfBlob || !fileUrl) {
    return <div>Loading PDF...</div>;
  }




  return (

    <main className='page-content'>

      {!isSignedIn && <center><p>You must sign in to access this page.</p></center>}

      <SignInModal show={showSignInModal}
        onClose={handleClose}
        signIn={signIn}
        setSuccessMessage={setSuccessMessage}
        successMessage={successMessage}
        onSignInSuccess={handleSignInSuccess}
      />

      {isSignedIn && (
        <Header />
      )}

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

            <div className='filter-icon' onClick={FilterhandleShow}>
              <img src={funnel} className='img-fluid' />
            </div>

          </div>
          <div className='block-img-div'>
            <div className='block-img'>
              <div className='popover-box popover-right'>
                <a href="#"> <FaArrowLeft /> Back</a>
                <a href="#" className='home-icon'> <FaHome /></a>
              </div>

              {Blocks && Blocks.block && (
                <div className='block-list-left'>
                  <span className='block-list-div'>Block {Blocks.block.block_name}</span>
                </div>
              )}

              <div className='select-plot-center'>
                <p className='block-list-div'>Select Your Plot</p>
                <div className="arrows"></div>
              </div>

              {/* <div className='img-overlay-top top-right' >
                  {hoveredBlockData && hoveredBlockData.sections && hoveredBlockData.sections.map((section) => (
                    <p className='block-name' key={section.id}>Section {section.section}</p>
                  ))}

                  {hoveredBlockData && (
                    <div className='available-plots-div'>
                      <p className='available-plot'>Available Plots</p>
                      <p className='available-plot-number'>{hoveredBlockData.count}</p>
                    </div>
                  )}

                </div> */}

              <div className='canvas-div'>

                {/* {pdfBlob && (

                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
                      <Viewer
                        fileUrl={fileUrl}
                        renderMode="canvas"
                        withCredentials={false}
                        onLoadSuccess={({ numPages, getPage }) => {
                          console.log('PDF Loaded Successfully:', numPages, 'pages');
                          getPage(1).then((page) => {
                            const scale = 1; // Adjust as needed
                            const viewport = page.getViewport({ scale });
                            setViewport(viewport); // Save viewport in state
                            console.log('Viewport Set:', viewport);

                            if (iframeRef.current) {
                              iframeRef.current.style.width = `${viewport.width}px`;
                              iframeRef.current.style.height = `${viewport.height}px`;
                            }

                            setBoundingRectangles(renderBoundingRectangles(viewport));
                          }).catch(error => console.error('Error loading page:', error));
                        }}
                        onLoadError={(error) => console.error('Error loading PDF:', error)}
                      />
                      <div
                        ref={iframeRef}
                        onClick={handleOverlayClick}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                          zIndex: 10,
                        }}
                      >
                        {viewport && boundingRectangles.length > 0 && renderBoundingRectangles(viewport)}
                      </div>
                    </div>
                  </Worker>
                )} */}

                {pdfBlob && (
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
                      <Viewer
                        fileUrl={fileUrl}
                        renderMode="canvas"
                        withCredentials={false}                        
                        onLoadSuccess={({ numPages, getPage }) => {
                          console.log('PDF Loaded Successfully:', numPages, 'pages');
                          getPage(1).then((page) => {
                            const scale = 1; // Adjust as needed
                            const viewport = page.getViewport({ scale });
                            setViewport(viewport); // Save viewport in state
                            console.log('Viewport Set:', viewport);

                            if (iframeRef.current) {
                              iframeRef.current.style.width = `${viewport.width}px`;
                              iframeRef.current.style.height = `${viewport.height}px`;
                            }

                            setBoundingRectangles(renderBoundingRectangles(viewport));
                          }).catch(error => console.error('Error loading page:', error));
                        }}
                        onLoadError={(error) => console.error('Error loading PDF:', error)}
                      />
                      <div
                        ref={iframeRef}
                        onClick={handleOverlayClick}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                          zIndex: 10,
                        }}
                      >
                        {viewport && boundingRectangles.length > 0 && renderBoundingRectangles(viewport)}
                      </div>
                    </div>
                  </Worker>
                )}





                <Modal show={showPlotModal} onHide={() => setShowPlotModal(false)}>
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

                    {plotDetails?.status !== "Not Available" && (
                      <Button
                        variant="primary"
                        onClick={() =>
                          navigate(`/booking/${plotDetails.project_id}/${plotDetails.id}/${user.id}`)
                        }
                      >
                        Book
                      </Button>
                    )}

                    <Button variant="secondary" onClick={() => setShowPlotModal(false)}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>

            </div>
          </div>

          <div className='block-div'>
            <div className='user-name'>
              <p>Hii!!! {user?.name}
              </p>
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

            <div className='scroll-bar-block-list'>
              <div className='amenities-icons-div'>
                {/* <ul>
                    {Blocks && Blocks.sections && Blocks.sections.map((section) => (
                      <li key={section.id} onMouseEnter={() => handleHover(section.project_id, section.block_id, section.id)}>
                        {section.available_plot_count > 0 ? (
                          <span className='side-nav-icon orange-color' onClick={() => navigate(`/section/${section.project_id}/${section.block_id}/${section.id}`)}>
                            <p>{section.section}</p>
                          </span>
                        ) : (
                          <span className='side-nav-icon orange-color'>
                            <p>{section.section}</p>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul> */}
              </div>
            </div>
          </div>
          <div className='project-logo'>
            <img src={imgUrl.imgUrl + `/storage/projects/${Projects.logo_file}`} className='img-fluid' alt={Projects.project_name} />
          </div>

        </div>


      )}

      <div>
        <Modal className="filter-popup" show={FilterShow} size='lg' onHide={FilterhandleClose} aria-labelledby="contained-modal-title-vcenter"
          centered>
          <Modal.Body>
            <div className='close-button ' onClick={FilterhandleClose}>
              <div className='close-icon'></div>
            </div>
            <FilterComponent onApplyFilters={handleApplyFilters} />
          </Modal.Body>
        </Modal>
      </div>



      <div>
        {filterResult && <PopupComponent data={filterResult} error={error} />}
        {loading && <p>Loading...</p>}
      </div>


    </main>



  );
}

export default BlockLayout;
