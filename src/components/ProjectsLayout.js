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

  // ── Body class ─────────────────────────────────────────
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

  // ── Keyboard nav: amenity modal ────────────────────────
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

  // ── Keyboard nav: brochure modal ───────────────────────
  useEffect(() => {
    if (!brochureModal) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeBrochure();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [brochureModal]);

  // ── Apply theme from settings ──────────────────────────
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    if (settings.primary_color)
      root.style.setProperty("--primary-color", settings.primary_color);
    if (settings.primary_color_hover)
      root.style.setProperty("--primary-hover", settings.primary_color_hover);
    if (settings.accent_color)
      root.style.setProperty("--accent-color", settings.accent_color);
    if (settings.text_color_dark)
      root.style.setProperty("--text-dark", settings.text_color_dark);
    if (settings.text_color_muted)
      root.style.setProperty("--text-muted", settings.text_color_muted);
    if (settings.card_border_color)
      root.style.setProperty("--card-border", settings.card_border_color);
    if (settings.page_bg_color)
      root.style.setProperty("--page-bg", settings.page_bg_color);
    if (settings.card_bg_color)
      root.style.setProperty("--card-bg", settings.card_bg_color);
    if (settings.heading_font)
      root.style.setProperty("--font-heading", settings.heading_font);
    if (settings.body_font)
      root.style.setProperty("--font-body", settings.body_font);
    if (settings.google_fonts_url) {
      let link = document.getElementById("dynamic-google-fonts");
      if (!link) {
        link = document.createElement("link");
        link.id = "dynamic-google-fonts";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = settings.google_fonts_url;
    }
  }, [settings]);

  return (
    <main className="projects-page">

      {/* ── Full-screen Split Header ─────────────────────── */}
      <header className="projects-header">

        {/* Left: Text */}
        <div className="projects-header__left">
          {settings.app_logo_dark_url && (
            <div className="logo-img-div">
              <img
                src={settings.app_logo_dark_url}
                alt={settings.app_name || "Logo"}
                className="projects-logo"
              />
            </div>
          )}

          <div className="projects-eyebrow-wrap">
            <span className="projects-eyebrow__line" />
            <span className="projects-eyebrow">
              {settings.app_eyebrow || "Our Portfolio"}
            </span>
          </div>

          <h1 className="projects-title">
            {settings.app_tagline || "Exceptional"}
            <em>{settings.app_tagline_italic || "Properties"}</em>
          </h1>

          <p className="projects-subtitle">
            {settings.app_subtitle ||
              "Discover handcrafted developments built for modern living"}
          </p>

          <div className="projects-header__scroll">
            <span className="projects-header__scroll-line" />
            Explore below
          </div>
        </div>

        {/* Divider */}
        <div className="projects-header__divider" />

        {/* Right: Hero image — use first project's image if available */}
        {projects.length > 0 && (
          <div className="projects-header__right">
            <img
              src={
                imgUrl.imgUrl +
                `/storage/projects/${projects[0].project_image_file}`
              }
              alt={projects[0].project_name}
              className="projects-header__hero-img"
            />
          </div>
        )}
      </header>

      {/* ── Section label ───────────────────────────────── */}
      <div className="projects-section-label">
        <h2 className="projects-section-label__text">
          All <em>Residences</em>
        </h2>
        {projects.length > 0 && (
          <span className="projects-section-label__count">
            {String(projects.length).padStart(2, "0")} Properties
          </span>
        )}
      </div>

      {/* ── Projects: Full-width split rows ─────────────── */}
      <div className={`projects-grid ${loaded ? "is-loaded" : ""}`}>
        {projects.map((project, index) => (
          <article
            key={project.id}
            className={`project-card ${hoveredId === project.id ? "is-hovered" : ""}`}
            style={{ animationDelay: `${index * 120}ms` }}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* ── Image Panel ──────────────────────────── */}
            <div
              className="project-card__image-panel"
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
              <div className="project-card__image-overlay" />
              {project.status && (
                <span className="project-card__status">{project.status}</span>
              )}

              {/* Logo overlaid on image */}
              <div className="project-card__logo-wrap">
                <img
                  src={
                    imgUrl.imgUrl + `/storage/projects/${project.logo_file}`
                  }
                  alt={`${project.project_name} logo`}
                  className="project-card__logo"
                />
              </div>
            </div>

            {/* ── Content Panel ────────────────────────── */}
            <div
              className="project-card__panel"
              data-index={String(index + 1).padStart(2, "0")}
            >
              {/* Tabs */}
              <div
                className="project-card__tabs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`tab-btn ${activeTab[project.id] === "overview" ? "active" : ""}`}
                  onClick={(e) => handleTabChange(project.id, "overview", e)}
                >
                  Overview
                </button>

                {project.amenities_count > 0 && (
                  <button
                    className={`tab-btn ${activeTab[project.id] === "amenities" ? "active" : ""}`}
                    onClick={(e) =>
                      handleTabChange(project.id, "amenities", e)
                    }
                  >
                    <FontAwesomeIcon
                      icon={faConciergeBell}
                      className="tab-icon"
                    />
                    Amenities
                  </button>
                )}

                {project.walkthroughs?.length > 0 && (
                  <button
                    className={`tab-btn ${activeTab[project.id] === "walkthrough" ? "active" : ""}`}
                    onClick={(e) =>
                      handleTabChange(project.id, "walkthrough", e)
                    }
                  >
                    <FontAwesomeIcon icon={faWalking} className="tab-icon" />
                    Walk
                  </button>
                )}

                {project.virtual_tours?.length > 0 && (
                  <button
                    className={`tab-btn ${activeTab[project.id] === "tour" ? "active" : ""}`}
                    onClick={(e) => handleTabChange(project.id, "tour", e)}
                  >
                    <FontAwesomeIcon
                      icon={faVrCardboard}
                      className="tab-icon"
                    />
                    360°
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="project-card__content">

                {/* Overview */}
                {activeTab[project.id] === "overview" && (
                  <div className="tab-content">
                    <div className="project-card__location">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="pin-icon"
                      />
                      <span>{project.location}</span>
                    </div>

                    <h3 className="project-card__name">
                      {project.project_name}
                    </h3>

                    {project.description && (
                      <p className="project-card__description">
                        {project.description}
                      </p>
                    )}

                    <div className="project-card__actions">
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
                          className="cta-arrow"
                        />
                      </button>

                      <div className="project-card__icon-actions">
                        {project.master_plan_id && (
                          <button
                            className="project-card__icon-btn"
                            title="360° Panorama"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/apartment-view/${project.master_plan_id}`
                              );
                            }}
                          >
                            <FontAwesomeIcon icon={faVrCardboard} />
                            <span>Panorama</span>
                          </button>
                        )}

                        {project.walkthroughs?.length > 0 && (
                          <button
                            className="project-card__icon-btn"
                            title="Walkthrough"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                project.walkthroughs[0].walkthrough_url,
                                "_blank"
                              );
                            }}
                          >
                            <FontAwesomeIcon icon={faWalking} />
                            <span>Walkthrough</span>
                          </button>
                        )}

                        {project.virtual_tours?.length > 0 && (
                          <button
                            className="project-card__icon-btn"
                            title="Virtual Tour"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                project.virtual_tours[0].tour_url,
                                "_blank"
                              );
                            }}
                          >
                            <FontAwesomeIcon icon={faVrCardboard} />
                            <span>360° Tour</span>
                          </button>
                        )}

                        {project.brochures?.length > 0 && (
                          <button
                            className="project-card__icon-btn"
                            title="Brochure"
                            onClick={(e) =>
                              openBrochure(
                                e,
                                imgUrl.imgUrl +
                                  `/storage/brochures/${project.brochures[0].brochure_file}`,
                                project.brochures[0].title ||
                                  project.project_name
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faFileAlt} />
                            <span>Brochure</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {activeTab[project.id] === "amenities" && (
                  <div className="tab-content amenities-tab">
                    <div className="amenities-grid">
                      {project.amenities?.map((amenity, i) => (
                        <div
                          key={i}
                          className="amenity-item"
                          onClick={(e) =>
                            openAmenityModal(
                              e,
                              project.amenities,
                              project.project_name,
                              i
                            )
                          }
                          title={amenity.amenity_name}
                        >
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
                        className="cta-arrow"
                      />
                    </button>
                  </div>
                )}

                {/* Walkthrough */}
                {activeTab[project.id] === "walkthrough" && (
                  <div className="tab-content tour-tab">
                    <h4 className="tab-heading">Walkthrough</h4>
                    {project.walkthroughs.map((wt, i) => (
                      <div
                        key={i}
                        className="tour-preview"
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

                {/* 360° Tour */}
                {activeTab[project.id] === "tour" && (
                  <div className="tab-content tour-tab">
                    <h4 className="tab-heading">360° Virtual Tour</h4>
                    {project.virtual_tours.map((vt, i) => (
                      <div
                        key={i}
                        className="tour-preview"
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
          </article>
        ))}
      </div>

      {/* ── Amenity Modal ───────────────────────────────── */}
      {amenityModal && (
        <div className="amenity-modal-overlay" onClick={closeAmenityModal}>
          <div
            className="amenity-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="amenity-modal__header">
              <h5>{amenityModal.projectName} — Amenities</h5>
              <button
                className="modal-close-btn"
                onClick={closeAmenityModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="amenity-modal__stage">
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

              {amenityModal.amenities.length > 1 && (
                <button
                  className="amenity-modal__nav amenity-modal__nav--next"
                  onClick={nextAmenity}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>

            {amenityModal.amenities.length > 1 && (
              <div className="amenity-modal__thumbs">
                {amenityModal.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className={`amenity-thumb ${i === amenityModal.currentIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAmenityModal((prev) => ({
                        ...prev,
                        currentIndex: i,
                      }));
                    }}
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
          <div
            className="brochure-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="brochure-modal__header">
              <h5>{brochureModal.name}</h5>
              <button className="modal-close-btn" onClick={closeBrochure}>
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
                <FontAwesomeIcon icon={faFileAlt} />
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
