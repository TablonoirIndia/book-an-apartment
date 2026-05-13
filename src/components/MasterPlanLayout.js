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

import { useSettings } from '../context/SettingsContext';

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

  // ── Theme ────────────────────────────────────────────────────────────────
  const { settings, isLoaded } = useSettings();
  const primaryColor    = settings?.primary_color      || '#c9a96e';
  const primaryHover    = settings?.primary_color_hover || '#a07a52';
  const pageBg          = settings?.page_bg_color       || '#faf9f7';
  const cardBg          = settings?.card_bg_color       || '#ffffff';
  const cardBorder      = settings?.card_border_color   || '#e8e0d4';
  const textDark        = settings?.text_color_dark     || '#1c1c1c';
  const textMuted       = settings?.text_color_muted    || '#888888';

  // ── Auth ─────────────────────────────────────────────────────────────────
  const { isSignedIn, signIn, user, signOut } = useContext(AuthContext);
  const [showSignInModal, setShowSignInModal] = useState(!isSignedIn);
  const [signedIn, setSignedIn] = useState(isSignedIn);
  const [successMessage, setSuccessMessage] = useState('');

  // ── Refs & state ─────────────────────────────────────────────────────────
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);

  const [plotDetails, setPlotDetails] = useState(null);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [boundingRectangles, setBoundingRectangles] = useState([]);
  const [pdfPath, setPdfPath] = useState('');
  const [hoveredPlotId, setHoveredPlotId] = useState(null);

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
  const FilterhandleShow  = () => setFilterShow(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterResult, setFilterResult] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(true);

  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: '100%', height: 'auto' });

  useEffect(() => { setModalIsOpen(true); }, []);

  const openModal  = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);
  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const handleApplyFilters = async (filterCriteria) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(apiUrl.apiUrl + `/api/filter/${projectId}`, filterCriteria);
      setFilterResult(response.data);
      FilterhandleClose();
    } catch (error) {
      FilterhandleClose();
      setFilterResult([]);
      if (error.response?.status === 404)      setError('No data found matching the filter criteria.');
      else if (error.response?.status === 400) setError('No filter criteria provided.');
      else                                     setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!projectId) return;

        const projectresponse = await fetch(apiUrl.apiUrl + `/api/project/${projectId}`);
        if (!projectresponse.ok) throw new Error('Failed to fetch data');
        const projectdata = await projectresponse.json();
        setProjects(projectdata);

        const response = await fetch(apiUrl.apiUrl + `/api/master-plan/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();

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

        const Amenitiesresponse = await fetch(apiUrl.apiUrl + `/api/amenities/${projectId}`);
        if (!Amenitiesresponse.ok) throw new Error('Failed to fetch data');
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
        if (!Blocksresponse.ok) throw new Error('Failed to fetch blocks data');
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
      if (!response.ok) throw new Error('Failed to fetch PDF');
      const blob = await response.blob();
      setPdfBlob(blob);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  const [showModal, setShowModal] = useState(null);
  const handleClose = () => setShowModal(null);
  const handleShow  = (amenityId) => setShowModal(amenityId);

  const handleHover = async (project_id, masterPlanId, block_id) => {
    try {
      const response = await fetch(`${apiUrl.apiUrl}/api/blocks/plot-count/${project_id}/${masterPlanId}/${block_id}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setHoveredBlockData(data);

      const coordinatesResponse = await axios.get(`${apiUrl.apiUrl}/api/masterplan/coordinates/${project_id}/${masterPlanId}/${block_id}`);
      const coordinatesData = coordinatesResponse.data;

      if (coordinatesData && Array.isArray(coordinatesData) && coordinatesData.length > 0) {
        const coordinatesArray = coordinatesData.map(item => {
          const webmapping = item.webmapping;
          if (!webmapping) return null;
          const coordinates = webmapping.split(',').map(Number);
          return { block: item.block, coordinates };
        }).filter(item => item !== null);

        setBoundingRectangles(coordinatesArray);
      } else {
        setBoundingRectangles([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setBoundingRectangles([]);
    }
  };

  // ── Block list (shared between mobile + desktop sidebar) ────────────────
  const BlockList = () => (
    <ul>
      {Blocks.map((block) => (
        <li key={block.id} onMouseEnter={() => handleHover(block.project_id, block.master_plan_id, block.id)}>
          {block.available_plot_count > 0 ? (
            <span
              className='side-nav-icon'
              style={{ '--block-active-color': primaryColor }}
              onClick={() => navigate(`/block/${block.project_id}/${block.master_plan_id}/${block.id}`)}
            >
              <p id={block.id}>{block.block_name}</p>
            </span>
          ) : (
            <span className='side-nav-icon side-nav-icon--sold'>
              <p id={block.id}>{block.block_name}</p>
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <main className='page-content' style={{ '--primary': primaryColor, '--primary-hover': primaryHover, '--page-bg': pageBg, '--card-bg': cardBg, '--card-border': cardBorder, '--text-dark': textDark, '--text-muted': textMuted }}>
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

      {/* ── Amenity modals ─────────────────────────────────── */}
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

        {/* ── Left sidebar ─────────────────────────────────── */}
        <div className='amenities-div'>
          <div className='sidebar-left-title'>
            <h4 style={{ color: textDark, fontFamily: settings?.heading_font }}>Amenities</h4>
          </div>
          <div className='amenities-icons-div'>
            <ul>
              {Amenities.map((amenity) => (
                <li key={amenity.id}>
                  <span
                    className='side-nav-icon'
                    style={{ backgroundImage: `url(${imgUrl.imgUrl}/storage/amenities/icons/${amenity.amenity_icon})` }}
                    onClick={() => handleShow(amenity.id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile block list */}
          <div className='block-div block-mobile-div'>
            <div className='sidebar-left-title'>
              <h4 style={{ color: textDark, fontFamily: settings?.heading_font }}>Phase</h4>
            </div>
            <div className='scroll-bar-block-list'>
              <div className='amenities-icons-div'>
                <BlockList />
              </div>
            </div>
          </div>

          <div className='filter-icon' onClick={FilterhandleShow}>
            <img src={funnel} className='img-fluid' alt="Filter" />
          </div>
        </div>

        {/* ── Main PDF viewer ───────────────────────────────── */}
        <div className='block-img-div'>
          <div className='block-img'>
            <div className='popover-box popover-right'>
              <a href="#" style={{ color: primaryColor }}>
                <FaArrowLeft /> Back
              </a>
            </div>

            {/* Hovered block info overlay */}
            {hoveredBlockData && (
              <div
                className='img-overlay-top top-right'
                style={{
                  background: `color-mix(in srgb, ${cardBg} 92%, transparent)`,
                  border: `1px solid ${cardBorder}`,
                  color: textDark,
                }}
              >
                <p className='block-name' style={{ color: primaryColor }}>
                  Phase {hoveredBlockData.block.block_name}
                </p>
                <div className='available-plots-div'>
                  <p className='available-plot' style={{ color: textMuted }}>Available Plots</p>
                  <p className='available-plot-number' style={{ color: textDark }}>
                    {hoveredBlockData.block.total_available_plot_count}
                  </p>
                </div>
              </div>
            )}

            <div className='canvas-div'>
              {pdfBlob && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
                    <Viewer
                      fileUrl={URL.createObjectURL(pdfBlob)}
                      renderMode="canvas"
                      withCredentials={false}
                    />

                    {/* Bounding-rectangle overlays for hovered block */}
                    {boundingRectangles.length > 0 && (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                        {boundingRectangles.map((rect, index) => (
                          <div
                            key={index}
                            style={{
                              position: 'absolute',
                              left: `${rect.coordinates[0]}px`,
                              top: `${rect.coordinates[1]}px`,
                              width: '100px',
                              height: '100px',
                              border: `2px solid ${primaryColor}`,
                              pointerEvents: 'none',
                              background: primaryColor,
                              opacity: 0.35,
                              borderRadius: '4px',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Worker>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop right block list ──────────────────────── */}
        <div className='block-div block-large-div'>
          <div className='sidebar-left-title'>
            <h4 style={{ color: textDark, fontFamily: settings?.heading_font }}>Phase</h4>
          </div>
          <div className='scroll-bar-block-list'>
            <div className='amenities-icons-div'>
              <BlockList />
            </div>
          </div>
        </div>

        {/* ── Project logo ──────────────────────────────────── */}
        <div className='project-logo'>
          <img
            src={imgUrl.imgUrl + `/storage/projects/${Projects.logo_file}`}
            className='img-fluid'
            alt={Projects.project_name}
          />
        </div>
      </div>

      {/* ── Filter modal ─────────────────────────────────────── */}
      <Modal
        className="filter-popup"
        show={FilterShow}
        size='lg'
        onHide={FilterhandleClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <div className='close-button' onClick={FilterhandleClose}>
            <div className='close-icon'></div>
          </div>
          <FilterComponent onApplyFilters={handleApplyFilters} />
        </Modal.Body>
      </Modal>

      <div>
        {filterResult && <PopupComponent data={filterResult} error={error} />}
        {loading && <p style={{ color: textMuted, fontFamily: settings?.body_font }}>Loading...</p>}
      </div>
    </main>
  );
}

export default MasterPlanLayout;
