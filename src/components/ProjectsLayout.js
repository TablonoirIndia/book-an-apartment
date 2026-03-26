import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faArrowRight,
  faVrCardboard,
  faFileAlt,
  faWalking,
  faConciergeBell,
  faTimes,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import * as apiUrl from "../apiUrl";
import * as imgUrl from "../apiUrl";
import "../styles/ProjectsLayout.css";

const ProjectsLayout = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState({});
  const [hoveredId, setHoveredId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState({});
  const [brochureModal, setBrochureModal] = useState(null);
  const [amenityModal, setAmenityModal] = useState(null);

  // ── Amenity modal handlers ─────────────────────────────
  const openAmenityModal = (e, amenities, projectName, startIndex = 0) => {
    e.stopPropagation();
    setAmenityModal({ amenities, currentIndex: startIndex, projectName });
  };
  const closeAmenityModal = () => setAmenityModal(null);

  const prevAmenity = (e) => {
    if (e) e.stopPropagation();
    setAmenityModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0
          ? prev.amenities.length - 1
          : prev.currentIndex - 1,
    }));
  };

  const nextAmenity = (e) => {
    if (e) e.stopPropagation();
    setAmenityModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === prev.amenities.length - 1
          ? 0
          : prev.currentIndex + 1,
    }));
  };

  // ── Brochure modal handlers ────────────────────────────
  const openBrochure = (e, url, name) => {
    e.stopPropagation();
    setBrochureModal({ url, name });
  };
  const closeBrochure = () => setBrochureModal(null);

  // ── Tab handler ────────────────────────────────────────
  const handleTabChange = (projectId, tab, e) => {
    e.stopPropagation();
    setActiveTab((prev) => ({ ...prev, [projectId]: tab }));
  };

  // ── Body class for dark bg ─────────────────────────────
  useEffect(() => {
    document.body.classList.add("projects-page-active");
    return () => document.body.classList.remove("projects-page-active");
  }, []);

  // ── Fetch settings ─────────────────────────────────────
  useEffect(() => {
    fetch(apiUrl.apiUrl + "/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  // ── Fetch projects ─────────────────────────────────────
  useEffect(() => {
    fetch(apiUrl.apiUrl + "/api/all-projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        const tabs = {};
        data.forEach((p) => (tabs[p.id] = "overview"));
        setActiveTab(tabs);
        setTimeout(() => setLoaded(true), 100);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  // ── Keyboard nav for amenity modal ─────────────────────
  useEffect(() => {
    if (!amenityModal) return;
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") prevAmenity(null);
      if (e.key === "ArrowRight") nextAmenity(null);
      if (e.key === "Escape") closeAmenityModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [amenityModal]);

  // ── Keyboard close for brochure modal ──────────────────
  useEffect(() => {
    if (!brochureModal) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeBrochure();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [brochureModal]);

  // ── Apply primary color ────────────────────────────────
  useEffect(() => {
    if (settings.primary_color) {
      document.documentElement.style.setProperty(
        "--primary-color",
        settings.primary_color,
      );
    }
  }, [settings]);

  return (
    <main className="projects-page">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="projects-header">
        {settings.app_logo_light_url && (
          <div className="logo-img-div">
            <img
              src={settings.app_logo_light_url}
              alt={settings.app_name || "Logo"}
              className="projects-logo"
            />
          </div>
        )}
        <span className="projects-eyebrow">
          {settings.app_eyebrow || "Our Portfolio"}
        </span>
        <h1 className="projects-title">
          {settings.app_tagline || "Exceptional"} <em>Properties</em>
        </h1>
        <p className="projects-subtitle">
          {settings.app_subtitle ||
            "Discover handcrafted developments built for modern living"}
        </p>
      </div>

      {/* ── Projects Grid ───────────────────────────────── */}
      <div className={`projects-grid ${loaded ? "is-loaded" : ""}`}>
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={`project-card ${hoveredId === project.id ? "is-hovered" : ""}`}
            style={{ animationDelay: `${index * 80}ms` }}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* ── Project Image ──────────────────────────── */}
            <div
              className="project-card__image-wrap"
              onClick={() => navigate(`/location/${project.id}`)}
            >
              <img
                src={
                  imgUrl.imgUrl +
                  `/storage/projects/${project.project_image_file}`
                }
                alt={project.project_name}
                className="project-card__image"
              />
              <div className="project-card__overlay" />
            </div>

            {/* ── Project Logo Badge ─────────────────────── */}
            <div className="project-card__logo-wrap">
              <img
                src={imgUrl.imgUrl + `/storage/projects/${project.logo_file}`}
                alt={`${project.project_name} logo`}
                className="project-card__logo"
              />
            </div>

            {/* ── Tabs ───────────────────────────────────── */}
            <div
              className="project-card__tabs"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Overview — always shown */}
              <button
                className={`tab-btn ${activeTab[project.id] === "overview" ? "active" : ""}`}
                onClick={(e) => handleTabChange(project.id, "overview", e)}
              >
                Overview
              </button>

              {/* Amenities — only if project has amenities */}
              {project.amenities_count > 0 && (
                <button
                  className={`tab-btn ${activeTab[project.id] === "amenities" ? "active" : ""}`}
                  onClick={(e) => handleTabChange(project.id, "amenities", e)}
                >
                  <FontAwesomeIcon icon={faConciergeBell} className="mr-1" />
                  Amenities
                </button>
              )}

              {/* Walkthrough — only if project has walkthroughs */}
              {project.walkthroughs?.length > 0 && (
                <button
                  className={`tab-btn ${activeTab[project.id] === "walkthrough" ? "active" : ""}`}
                  onClick={(e) => handleTabChange(project.id, "walkthrough", e)}
                >
                  <FontAwesomeIcon icon={faWalking} className="mr-1" />
                  Walkthrough
                </button>
              )}

              {/* 360° Virtual Tour — only if project has virtual tours */}
              {project.virtual_tours?.length > 0 && (
                <button
                  className={`tab-btn ${activeTab[project.id] === "tour" ? "active" : ""}`}
                  onClick={(e) => handleTabChange(project.id, "tour", e)}
                >
                  <FontAwesomeIcon icon={faVrCardboard} className="mr-1" />
                  360° Tour
                </button>
              )}
            </div>

            {/* ── Tab Content ────────────────────────────── */}
            <div className="project-card__content">
              {/* ── Overview Tab ───────────────────────── */}
              {activeTab[project.id] === "overview" && (
                <div className="tab-content">
                  <div className="project-card__location">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="project-card__pin"
                    />
                    <span>{project.location}</span>
                  </div>
                  <h3 className="project-card__name">{project.project_name}</h3>

                  <div className="project-card__actions">
                    {/* Choose Units */}
                    <button
                      className="project-card__cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/location/${project.id}`);
                      }}
                    >
                      Choose Your Units
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="project-card__arrow"
                      />
                    </button>
                    {/* 360° Panorama — internal view */}
                    {project.master_plan_id && (
                      <button
                        className="project-card__icon-btn"
                        title="360° Panorama View"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/apartment-view/${project.master_plan_id}`);
                        }}
                      >
                        <FontAwesomeIcon icon={faVrCardboard} />
                        <span>360°</span>
                      </button>
                    )}

                    {/* Walkthrough quick button */}
                    {project.walkthroughs?.length > 0 && (
                      <button
                        className="project-card__icon-btn"
                        title="Walkthrough"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            project.walkthroughs[0].walkthrough_url,
                            "_blank",
                          );
                        }}
                      >
                        <FontAwesomeIcon icon={faWalking} />
                        <span>Walk</span>
                      </button>
                    )}

                    {/* 360° Virtual Tour quick button */}
                    {project.virtual_tours?.length > 0 && (
                      <button
                        className="project-card__icon-btn"
                        title="360° Virtual Tour"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            project.virtual_tours[0].tour_url,
                            "_blank",
                          );
                        }}
                      >
                        <FontAwesomeIcon icon={faVrCardboard} />
                        <span>360°</span>
                      </button>
                    )}

                    {/* Brochure quick button */}
                    {project.brochures?.length > 0 && (
                      <button
                        className="project-card__icon-btn"
                        title="View Brochure"
                        onClick={(e) =>
                          openBrochure(
                            e,
                            imgUrl.imgUrl +
                              `/storage/brochures/${project.brochures[0].brochure_file}`,
                            project.brochures[0].title || project.project_name,
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faFileAlt} />
                        <span>Brochure</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Amenities Tab ───────────────────────── */}
              {activeTab[project.id] === "amenities" && (
                <div className="tab-content amenities-tab">
                  <h4 className="tab-heading">Amenities</h4>
                  <div className="amenities-grid">
                    {project.amenities &&
                      project.amenities.map((amenity, i) => (
                        <div
                          key={i}
                          className="amenity-item"
                          onClick={(e) =>
                            openAmenityModal(
                              e,
                              project.amenities,
                              project.project_name,
                              i,
                            )
                          }
                          title={`View ${amenity.amenity_name}`}
                        >
                          {/* Icon — from icons folder */}
                          {amenity.amenity_icon ? (
                            <img
                              src={
                                imgUrl.imgUrl +
                                `/storage/amenities/icons/${amenity.amenity_icon}`
                              }
                              alt={amenity.amenity_name}
                              className="amenity-icon"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faConciergeBell}
                              className="amenity-icon-fa"
                            />
                          )}

                          <span className="amenity-name">
                            {amenity.amenity_name}
                          </span>

                          {/* Expand hint if full image exists */}
                          {amenity.amenity_image && (
                            <span className="amenity-expand-hint">
                              <FontAwesomeIcon icon={faExpand} />
                            </span>
                          )}
                        </div>
                      ))}
                  </div>

                  <button
                    className="project-card__cta mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/location/${project.id}`);
                    }}
                  >
                    Explore Project
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="project-card__arrow"
                    />
                  </button>
                </div>
              )}

              {/* ── Walkthrough Tab ─────────────────────── */}
              {activeTab[project.id] === "walkthrough" && (
                <div className="tab-content tour-tab">
                  <h4 className="tab-heading">Walkthrough</h4>
                  {project.walkthroughs.map((wt, i) => (
                    <div
                      key={i}
                      className="tour-preview mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(wt.walkthrough_url, "_blank");
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faWalking}
                        className="tour-play-icon"
                      />
                      <span>{wt.title || `Walkthrough ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── 360° Virtual Tour Tab ───────────────── */}
              {activeTab[project.id] === "tour" && (
                <div className="tab-content tour-tab">
                  <h4 className="tab-heading">360° Virtual Tour</h4>
                  {project.virtual_tours.map((vt, i) => (
                    <div
                      key={i}
                      className="tour-preview mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(vt.tour_url, "_blank");
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faVrCardboard}
                        className="tour-play-icon"
                      />
                      <span>{vt.title || `360° Tour ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Amenity Modal ───────────────────────────────── */}
      {amenityModal && (
        <div className="amenity-modal-overlay" onClick={closeAmenityModal}>
          <div className="amenity-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="amenity-modal__header">
              <h5>
                <FontAwesomeIcon icon={faConciergeBell} className="mr-2" />
                {amenityModal.projectName} — Amenities
              </h5>
              <button
                className="amenity-modal__close"
                onClick={closeAmenityModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Stage */}
            <div className="amenity-modal__stage">
              {/* Prev */}
              {amenityModal.amenities.length > 1 && (
                <button
                  className="amenity-modal__nav amenity-modal__nav--prev"
                  onClick={prevAmenity}
                >
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    style={{ transform: "rotate(180deg)" }}
                  />
                </button>
              )}

              {/* Main image */}
              <div className="amenity-modal__image-wrap">
                {amenityModal.amenities[amenityModal.currentIndex]
                  ?.amenity_image ? (
                  <img
                    key={amenityModal.currentIndex}
                    src={
                      imgUrl.imgUrl +
                      `/storage/amenities/${amenityModal.amenities[amenityModal.currentIndex].amenity_image}`
                    }
                    alt={
                      amenityModal.amenities[amenityModal.currentIndex]
                        .amenity_name
                    }
                    className="amenity-modal__image"
                  />
                ) : (
                  <div className="amenity-modal__no-image">
                    <FontAwesomeIcon icon={faConciergeBell} />
                    <span>No image available</span>
                  </div>
                )}

                {/* Name + icon overlay */}
                <div className="amenity-modal__name-overlay">
                  {amenityModal.amenities[amenityModal.currentIndex]
                    ?.amenity_icon && (
                    <img
                      src={
                        imgUrl.imgUrl +
                        `/storage/amenities/icons/${amenityModal.amenities[amenityModal.currentIndex].amenity_icon}`
                      }
                      alt="icon"
                      className="amenity-modal__icon-badge"
                    />
                  )}
                  <span className="amenity-modal__name">
                    {
                      amenityModal.amenities[amenityModal.currentIndex]
                        ?.amenity_name
                    }
                  </span>
                  <span className="amenity-modal__counter">
                    {amenityModal.currentIndex + 1} /{" "}
                    {amenityModal.amenities.length}
                  </span>
                </div>
              </div>

              {/* Next */}
              {amenityModal.amenities.length > 1 && (
                <button
                  className="amenity-modal__nav amenity-modal__nav--next"
                  onClick={nextAmenity}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            {amenityModal.amenities.length > 1 && (
              <div className="amenity-modal__thumbs">
                {amenityModal.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className={`amenity-thumb ${i === amenityModal.currentIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAmenityModal((prev) => ({ ...prev, currentIndex: i }));
                    }}
                    title={amenity.amenity_name}
                  >
                    {amenity.amenity_icon ? (
                      <img
                        src={
                          imgUrl.imgUrl +
                          `/storage/amenities/icons/${amenity.amenity_icon}`
                        }
                        alt={amenity.amenity_name}
                        className="amenity-thumb__icon"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faConciergeBell}
                        className="amenity-thumb__fa"
                      />
                    )}
                    <span className="amenity-thumb__name">
                      {amenity.amenity_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Brochure Modal ──────────────────────────────── */}
      {brochureModal && (
        <div className="brochure-modal-overlay" onClick={closeBrochure}>
          <div className="brochure-modal" onClick={(e) => e.stopPropagation()}>
            <div className="brochure-modal__header">
              <h5>{brochureModal.name} — Brochure</h5>
              <button className="brochure-modal__close" onClick={closeBrochure}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="brochure-modal__body">
              <iframe
                src={brochureModal.url}
                title="Brochure"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            </div>

            <div className="brochure-modal__footer">
              <a
                href={brochureModal.url}
                download
                className="project-card__cta"
                onClick={(e) => e.stopPropagation()}
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProjectsLayout;
