import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faArrowLeft,
  faLocationArrow,
  faRoad,
  faChevronLeft,
  faChevronRight,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

import buildingIcon from "../asserts/img/building.png";
import buildingIcon1 from "../asserts/img/building-1.png";
import * as apiUrl from "../apiUrl";
import * as imgUrl from "../apiUrl";
import "../styles/LocationPage.css";

// ── Constants ──────────────────────────────────────────────
const mapContainerStyle = { width: "100%", height: "100%" };

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#0d0d0d" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d0d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#c9a96e" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#1a1a1a" }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#c9a96e" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#181818" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1e1e1e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#141414" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1a1a1a" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#c9a96e" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#1a1a1a" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#050505" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3d3d3d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#050505" }],
    },
  ],
};

// ══════════════════════════════════════════════════════════
// CurveOverlay — single SVG element appended to map div
// ══════════════════════════════════════════════════════════
function CurveOverlay({ map, from, markers, activeMarkerId }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const offsetRef = useRef(0);

  // ── Convert lat/lng → pixel coords relative to map div ──
  const latLngToPixel = useCallback(
    (lat, lng) => {
      const proj = map.getProjection();
      if (!proj) return { x: 0, y: 0 };
      const scale = Math.pow(2, map.getZoom());
      const worldPt = proj.fromLatLngToPoint(
        new window.google.maps.LatLng(lat, lng),
      );
      const centerWP = proj.fromLatLngToPoint(map.getCenter());
      const mapDiv = map.getDiv();
      return {
        x: mapDiv.offsetWidth / 2 + (worldPt.x - centerWP.x) * scale,
        y: mapDiv.offsetHeight / 2 + (worldPt.y - centerWP.y) * scale,
      };
    },
    [map],
  );

  // ── Build all SVG paths ───────────────────────────────
  const buildPaths = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !map || !from) return;

    const mapDiv = map.getDiv();
    svg.setAttribute("width", mapDiv.offsetWidth);
    svg.setAttribute("height", mapDiv.offsetHeight);

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Glow filter
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
            <filter id="curve-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
    svg.appendChild(defs);

    const p1 = latLngToPixel(from.lat, from.lng);

    markers.forEach((marker) => {
      const p2 = latLngToPixel(marker.lat, marker.lng);
      const isActive = activeMarkerId === marker.id;

      // Bezier control point (perpendicular arc)
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const bend = len * 0.3;
      const cpx = mx - (dy / len) * bend;
      const cpy = my + (dx / len) * bend;
      const d = `M ${p1.x} ${p1.y} Q ${cpx} ${cpy} ${p2.x} ${p2.y}`;

      // Glow layer (active only)
      if (isActive) {
        const glow = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        glow.setAttribute("d", d);
        glow.setAttribute("fill", "none");
        glow.setAttribute("stroke", "#f5c97a");
        glow.setAttribute("stroke-width", "8");
        glow.setAttribute("stroke-opacity", "0.18");
        glow.setAttribute("stroke-linecap", "round");
        svg.appendChild(glow);
      }

      // Main dashed curve
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", isActive ? "#f5c97a" : "#c9a96e");
      path.setAttribute("stroke-width", isActive ? "2.5" : "1.6");
      path.setAttribute("stroke-opacity", isActive ? "1" : "0.45");
      path.setAttribute("stroke-dasharray", "7 11");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("data-marker", marker.id);
      if (isActive) path.setAttribute("filter", "url(#curve-glow)");
      svg.appendChild(path);

      // Endpoint dot
      const dot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      dot.setAttribute("cx", p2.x);
      dot.setAttribute("cy", p2.y);
      dot.setAttribute("r", isActive ? "5" : "3.5");
      dot.setAttribute("fill", isActive ? "#f5c97a" : "#c9a96e");
      dot.setAttribute("stroke", "#0d0d0d");
      dot.setAttribute("stroke-width", "1.5");
      dot.setAttribute("opacity", isActive ? "1" : "0.6");
      svg.appendChild(dot);
    });
  }, [map, from, markers, activeMarkerId, latLngToPixel]);

  // ── Animate dash flow ─────────────────────────────────
  useEffect(() => {
    const animate = () => {
      offsetRef.current -= 0.4;
      const svg = svgRef.current;
      if (svg) {
        svg.querySelectorAll("path[data-marker]").forEach((p) => {
          p.setAttribute("stroke-dashoffset", offsetRef.current);
        });
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // ── Rebuild on map movement ───────────────────────────
  useEffect(() => {
    if (!map) return;
    buildPaths();
    const events = ["zoom_changed", "center_changed", "bounds_changed", "idle"];
    const listeners = events.map((e) => map.addListener(e, buildPaths));
    return () =>
      listeners.forEach((l) => window.google.maps.event.removeListener(l));
  }, [map, buildPaths]);

  // ── Mount SVG directly into map div ──────────────────
  useEffect(() => {
    if (!map) return;
    const mapDiv = map.getDiv();
    const svg = svgRef.current;
    if (!svg) return;
    mapDiv.style.position = "relative";
    mapDiv.appendChild(svg);
    return () => {
      if (mapDiv.contains(svg)) mapDiv.removeChild(svg);
    };
  }, [map]);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════
// GoogleMapWithMarkers
// ══════════════════════════════════════════════════════════
function GoogleMapWithMarkers() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [masterPlanId, setMasterPlanId] = useState(null);

  const mapRef = useRef(null);

  const [markers, setMarkers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedProjectLocation, setSelectedProjectLocation] = useState(null);
  const [firstLocation, setFirstLocation] = useState(null);
  const [center, setCenter] = useState(null);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [customIcon, setCustomIcon] = useState(null);
  const [locationIcon, setLocationIcon] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch locations + project center ──────────────────
  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [locRes, projRes] = await Promise.all([
          fetch(apiUrl.apiUrl + `/api/location/${projectId}`),
          fetch(apiUrl.apiUrl + `/api/project/location/${projectId}`),
        ]);
        const locData = await locRes.json();
        const projData = await projRes.json();

        const formatted = locData.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.location_image,
          location: {
            lat: parseFloat(item.latitude),
            lng: parseFloat(item.longitude),
          },
        }));

        setMenuItems(formatted);
        setMarkers(
          formatted.map((item) => ({
            id: item.id,
            lat: item.location.lat,
            lng: item.location.lng,
            name: item.name,
          })),
        );

        const pc = {
          lat: parseFloat(projData.latitude),
          lng: parseFloat(projData.longitude),
        };
        setFirstLocation(pc);
        setCenter(pc);
        setProjectName(projData.project_name || "Project");
        setMasterPlanId(projData.master_plan_id || null);
      } catch (err) {
        console.error("Error fetching location data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // ── Set icons after maps API is ready ─────────────────
  useEffect(() => {
    if (isMapsLoaded) {
      setCustomIcon({
        url: buildingIcon1,
        scaledSize: new window.google.maps.Size(52, 52),
        anchor: new window.google.maps.Point(26, 52),
      });
      setLocationIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#c9a96e",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      });
    }
  }, [isMapsLoaded]);

  // ── Handlers ──────────────────────────────────────────
  const handleMapLoad = useCallback((m) => {
    mapRef.current = m;
    setIsMapsLoaded(true);
  }, []);

  const moveToLocation = useCallback((loc) => {
    if (mapRef.current) {
      mapRef.current.panTo(loc);
      mapRef.current.setZoom(15);
    }
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }, []);

  const handleMarkerHover = useCallback((loc, id, name) => {
    setSelectedLocation({ ...loc, name });
    setActiveMarkerId(id);
  }, []);

  const handleProjectHover = useCallback(() => {
    setSelectedProjectLocation({ ...firstLocation, name: projectName });
    setActiveMarkerId("project");
  }, [firstLocation, projectName]);

  const handleMarkerClose = useCallback(() => {
    setSelectedLocation(null);
    setSelectedProjectLocation(null);
    setActiveMarkerId(null);
  }, []);

  const handleItemClick = useCallback(
    (item) => {
      setActiveMarkerId(item.id);
      moveToLocation(item.location);
      setSelectedLocation({ ...item.location, name: item.name });
      setSelectedProjectLocation(null);
    },
    [moveToLocation],
  );

  const handleProjectClick = useCallback(() => {
    if (firstLocation) {
      moveToLocation(firstLocation);
      setSelectedProjectLocation({ ...firstLocation, name: projectName });
      setSelectedLocation(null);
      setActiveMarkerId("project");
    }
  }, [firstLocation, projectName, moveToLocation]);

  // ── Loading screen ────────────────────────────────────
  if (isLoading) {
    return (
      <div className="loc-loading">
        <div className="loc-loading__inner">
          <div className="loc-loading__pin">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
          </div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loc-page">
      <div className="loc-map-container">
        {/* ── Floating Sidebar ─────────────────── */}
        <aside
          className={`loc-panel ${sidebarOpen ? "loc-panel--open" : "loc-panel--closed"}`}
        >
          <button
            className="loc-panel__toggle"
            onClick={() => setSidebarOpen((p) => !p)}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            <FontAwesomeIcon
              icon={sidebarOpen ? faChevronLeft : faChevronRight}
            />
          </button>

          {sidebarOpen && (
            <>
              {/* Header */}
              <div className="loc-panel__header">
                <button
                  className="loc-panel__back"
                  onClick={() => navigate(-1)}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <div className="loc-panel__title">
                  <span className="loc-panel__eyebrow">Nearby</span>
                  <h4 className="loc-panel__heading">Locations</h4>
                </div>
              </div>

              {/* Project row */}
              <div
                className={`loc-panel__project-item ${activeMarkerId === "project" ? "active" : ""}`}
                onClick={handleProjectClick}
              >
                {/* // Sidebar project icon */}
                <div className="loc-panel__project-icon">
                  <img
                    src={buildingIcon}
                    alt="Project"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (masterPlanId)
                        navigate(`/apartment-view/${masterPlanId}`);
                    }}
                  />
                </div>
                <div className="loc-panel__project-info">
                  <span className="loc-panel__project-name">{projectName}</span>
                  <span className="loc-panel__project-badge">
                    Project Location
                  </span>
                </div>
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="loc-panel__project-arrow"
                />
              </div>

              {/* Divider */}
              <div className="loc-panel__divider">
                <span>
                  {menuItems.length} location{menuItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Location list */}
              <div className="loc-panel__list">
                {menuItems.length === 0 ? (
                  <div className="loc-panel__empty">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <p>No locations added yet</p>
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`loc-panel__item ${activeMarkerId === item.id ? "active" : ""}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="loc-panel__item-icon">
                        {item.image ? (
                          <img
                            src={`${imgUrl.imgUrl}/storage/location/${item.image}`}
                            alt={item.name}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faLocationArrow} />
                        )}
                      </div>
                      <div className="loc-panel__item-info">
                        <span className="loc-panel__item-name">
                          {item.name}
                        </span>
                        {firstLocation && (
                          <span className="loc-panel__item-dist">
                            <FontAwesomeIcon icon={faRoad} />
                            {calculateDistance(
                              firstLocation.lat,
                              firstLocation.lng,
                              item.location.lat,
                              item.location.lng,
                            )}{" "}
                            km away
                          </span>
                        )}
                      </div>
                      {activeMarkerId === item.id && (
                        <div className="loc-panel__item-dot" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        {/* ── Map ──────────────────────────────── */}
        <div className="loc-map">
          {center && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              options={mapOptions}
              onLoad={handleMapLoad}
            >
              {/* Animated curved lines */}
              {isMapsLoaded &&
                mapRef.current &&
                firstLocation &&
                markers.length > 0 && (
                  <CurveOverlay
                    map={mapRef.current}
                    from={firstLocation}
                    markers={markers}
                    activeMarkerId={activeMarkerId}
                  />
                )}

              {/* Project marker */}
              {customIcon && (
                <Marker
                  position={center}
                  icon={customIcon}
                  onClick={() =>
                    masterPlanId && navigate(`/apartment-view/${masterPlanId}`)
                  }
                  onMouseOver={handleProjectHover}
                  onMouseOut={handleMarkerClose}
                  zIndex={10}
                />
              )}

              {/* Location markers */}
              {locationIcon &&
                markers.map((marker) => (
                  <Marker
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    icon={
                      activeMarkerId === marker.id
                        ? {
                            ...locationIcon,
                            scale: 12,
                            fillColor: "#f5c97a",
                            strokeWeight: 3,
                          }
                        : locationIcon
                    }
                    onMouseOver={() =>
                      handleMarkerHover(
                        { lat: marker.lat, lng: marker.lng },
                        marker.id,
                        marker.name,
                      )
                    }
                    onMouseOut={handleMarkerClose}
                    onClick={() => {
                      const item = menuItems.find((m) => m.id === marker.id);
                      if (item) handleItemClick(item);
                    }}
                    zIndex={activeMarkerId === marker.id ? 20 : 5}
                  />
                ))}

              {/* Location InfoWindow */}
              {selectedLocation && (
                <InfoWindow
                  position={{
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                  }}
                  onCloseClick={handleMarkerClose}
                  options={{ pixelOffset: new window.google.maps.Size(0, -14) }}
                >
                  <div className="loc-popup">
                    <div className="loc-popup__icon">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                    <div className="loc-popup__body">
                      <div className="loc-popup__name">
                        {selectedLocation.name}
                      </div>
                      {firstLocation && (
                        <div className="loc-popup__meta">
                          <span className="loc-popup__dist">
                            <FontAwesomeIcon icon={faRoad} />
                            {calculateDistance(
                              firstLocation.lat,
                              firstLocation.lng,
                              selectedLocation.lat,
                              selectedLocation.lng,
                            )}{" "}
                            km from project
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Project InfoWindow */}
              {selectedProjectLocation && (
                <InfoWindow
                  position={{
                    lat: selectedProjectLocation.lat,
                    lng: selectedProjectLocation.lng,
                  }}
                  onCloseClick={handleMarkerClose}
                  options={{ pixelOffset: new window.google.maps.Size(0, -56) }}
                >
                  <div className="loc-popup loc-popup--project">
                    <div className="loc-popup__icon loc-popup__icon--project">
                      <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div className="loc-popup__body">
                      <div className="loc-popup__name">
                        {selectedProjectLocation.name}
                      </div>
                      <div className="loc-popup__badge">Project Location</div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(GoogleMapWithMarkers);
