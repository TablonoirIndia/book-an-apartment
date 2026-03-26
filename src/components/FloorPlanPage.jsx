import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

const toRad = (deg) => parseFloat((deg * (Math.PI / 180)).toFixed(6));
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  available:    { color: "#22c55e", bg: "rgba(34,197,94,0.92)",   glow: "rgba(34,197,94,0.7)",   label: "Available"    },
  "pre-booked": { color: "#f59e0b", bg: "rgba(245,158,11,0.92)",  glow: "rgba(245,158,11,0.7)",  label: "Pre-Booked"   },
  booked:       { color: "#ef4444", bg: "rgba(239,68,68,0.92)",   glow: "rgba(239,68,68,0.7)",   label: "Booked"       },
  sold:         { color: "#ef4444", bg: "rgba(239,68,68,0.92)",   glow: "rgba(239,68,68,0.7)",   label: "Sold"         },
};

const getStatus = (raw) => {
  const key = (raw || "").toLowerCase().replace(/\s+/g, "-");
  return STATUS_CONFIG[key] || { color: "#94a3b8", bg: "rgba(148,163,184,0.92)", glow: "rgba(148,163,184,0.7)", label: raw || "Unknown" };
};

const isAvailable = (raw) => (raw || "").toLowerCase() === "available";

// ── Marker HTML builder ───────────────────────────────────────────────────────
const markerHtml = (label, status) => {
  const cfg = getStatus(status);
  return `<div class="unit-marker" style="background:${cfg.bg};--glow:${cfg.glow}">
    <span class="unit-marker-dot" style="background:${cfg.color}"></span>
    ${label}
  </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
const FloorPlanPage = () => {
  const { floorId } = useParams();
  const navigate    = useNavigate();

  const containerRef = useRef(null);
  const viewerRef    = useRef(null);
  const overlayRef   = useRef(null);
  const labelRef     = useRef(null);
  const intervalRef  = useRef(null);
  const markersPluginRef = useRef(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded,     setIsLoaded]     = useState(false);
  const [panoramaUrl,  setPanoramaUrl]  = useState(null);
  const [hotspots,     setHotspots]     = useState(null);
  const [blockName,    setBlockName]    = useState("");
  const [masterPlanId, setMasterPlanId] = useState(null);
  const [fetchError,   setFetchError]   = useState(null);
  const [isFetching,   setIsFetching]   = useState(true);

  // Popup state
  const [popup, setPopup] = useState(null); // { label, status, plotId, x, y }

  // ── Fetch block + hotspots ────────────────────────────────────────────────
  useEffect(() => {
    if (!floorId) { setFetchError("No block ID in URL."); setIsFetching(false); return; }

    const fetchAll = async () => {
      try {
        const blockRes = await fetch(`${API_BASE}/block/${floorId}`, { headers: { Accept: "application/json" } });
        if (!blockRes.ok) throw new Error(`Block API error ${blockRes.status}`);
        const blockData = await blockRes.json();
        if (!blockData.panorama_url) throw new Error("No panorama uploaded for this floor yet.");

        setPanoramaUrl(blockData.panorama_url);
        setBlockName(blockData.name || `Floor ${floorId}`);
        setMasterPlanId(blockData.master_plan_id);

        const hotspotRes = await fetch(`${API_BASE}/hotspots?block_id=${floorId}`, { headers: { Accept: "application/json" } });
        if (!hotspotRes.ok) throw new Error(`Hotspots API error ${hotspotRes.status}`);
        const rawHotspots = await hotspotRes.json();

        // ── Enrich with status ──────────────────────────────────────────
        // If hotspot already has a status field, use it directly.
        // Otherwise fetch /api/unit/:plotId for each hotspot in parallel.
        const needsStatus = rawHotspots.some(h => !h.status);

        let enriched = rawHotspots;
        if (needsStatus) {
          enriched = await Promise.all(
            rawHotspots.map(async (h) => {
              if (h.status) return h; // already has it
              try {
                const uRes  = await fetch(`${API_BASE}/unit/${h.plot_id}`, { headers: { Accept: "application/json" } });
                const uData = uRes.ok ? await uRes.json() : {};
                return { ...h, status: uData.status || "unknown" };
              } catch {
                return { ...h, status: "unknown" };
              }
            })
          );
        }

        setHotspots(enriched);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAll();
  }, [floorId]);

  // ── Init PSV ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!panoramaUrl || !hotspots || !containerRef.current) return;

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 8;
      if (current >= 90) { current = 90; clearInterval(intervalRef.current); }
      setLoadProgress(Math.round(current));
    }, 200);

    const psvMarkers = hotspots.map((h) => ({
      id:       `unit-${h.id}`,
      position: { yaw: toRad(parseFloat(h.yaw)), pitch: toRad(parseFloat(h.pitch)) },
      html:     markerHtml(h.label, h.status),
      size:     { width: 160, height: 42 },
      data: {
        hotspotId: h.id,
        plotId:    h.plot_id,
        name:      h.label,
        status:    h.status,
        yawRad:    toRad(parseFloat(h.yaw)),
        pitchRad:  toRad(parseFloat(h.pitch)),
      },
    }));

    viewerRef.current = new Viewer({
      container:         containerRef.current,
      panorama:          panoramaUrl,
      defaultZoomLvl:    50,
      mousewheelCtrlKey: false,
      loadingImg:        null,
      loadingTxt:        "",
      navbar:            ["zoom", "move", "caption", "fullscreen"],
      plugins:           [[MarkersPlugin, { markers: psvMarkers }]],
    });

    viewerRef.current.addEventListener("ready", () => {
      clearInterval(intervalRef.current);
      setLoadProgress(100);
      setTimeout(() => setIsLoaded(true), 700);

      let angle = 0, isInteracting = false, resumeTimeout = null;
      const swing = () => {
        if (!isInteracting) {
          angle += 0.003;
          try { viewerRef.current?.rotate({ yaw: Math.sin(angle) * 0.08, pitch: 0 }); } catch(e) {}
        }
        if (viewerRef.current) viewerRef.current._rafId = requestAnimationFrame(swing);
      };
      viewerRef.current._rafId = requestAnimationFrame(swing);

      const onStart = () => { isInteracting = true; clearTimeout(resumeTimeout); };
      const onEnd   = () => { resumeTimeout = setTimeout(() => { isInteracting = false; }, 2000); };
      const el = containerRef.current;
      if (el) {
        el.addEventListener("mousedown",  onStart, { passive: true });
        el.addEventListener("mouseup",    onEnd,   { passive: true });
        el.addEventListener("touchstart", onStart, { passive: true });
        el.addEventListener("touchend",   onEnd,   { passive: true });
      }

      viewerRef.current._cleanup = () => {
        if (viewerRef.current?._rafId) cancelAnimationFrame(viewerRef.current._rafId);
        clearTimeout(resumeTimeout);
        if (el) {
          el.removeEventListener("mousedown",  onStart);
          el.removeEventListener("mouseup",    onEnd);
          el.removeEventListener("touchstart", onStart);
          el.removeEventListener("touchend",   onEnd);
        }
      };
    });

    markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin);

    markersPluginRef.current.addEventListener("select-marker", ({ marker }) => {
      const { plotId, name, status, yawRad, pitchRad } = marker.data;

      // Close any existing popup first
      setPopup(null);

      if (isAvailable(status)) {
        // ── Available: animate and navigate ──────────────────────────
        hotspots.forEach((h) => {
          try { markersPluginRef.current?.updateMarker({ id: `unit-${h.id}`, opacity: 0 }); } catch(e) {}
        });
        if (labelRef.current) {
          labelRef.current.textContent   = name;
          labelRef.current.style.opacity = "1";
        }
        viewerRef.current
          ?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 55, speed: "4rpm" })
          .then(() => viewerRef.current?.animate({ yaw: yawRad, pitch: pitchRad, zoom: 100, speed: "20rpm" }))
          .then(() => {
            if (overlayRef.current) {
              overlayRef.current.style.transition = "opacity 0.4s ease-in";
              overlayRef.current.style.opacity    = "1";
            }
            setTimeout(() => navigate(`/unit/${plotId}`), 450);
          });
      } else {
        // ── Not available: show popup ─────────────────────────────────
        setPopup({ label: name, status, plotId });
      }
    });

    return () => {
      clearInterval(intervalRef.current);
      viewerRef.current?._cleanup?.();
      try { viewerRef.current?.destroy(); } catch(e) {}
      viewerRef.current       = null;
      markersPluginRef.current = null;
    };
  }, [panoramaUrl, hotspots]);

  // ── Entry fade-in ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.style.opacity    = "1";
    overlayRef.current.style.transition = "none";
    const t = setTimeout(() => {
      overlayRef.current.style.transition = "opacity 0.7s ease-out";
      overlayRef.current.style.opacity    = "0";
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const handleBackClick = () => {
    if (overlayRef.current) {
      overlayRef.current.style.transition = "opacity 0.4s ease-in";
      overlayRef.current.style.opacity    = "1";
    }
    setTimeout(() => navigate(`/apartment-view/${masterPlanId || ""}`), 450);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isFetching) return (
    <div style={{ height:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px" }}>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
      <div style={{ fontSize:"48px" }}>🏠</div>
      <div style={{ color:"white", fontSize:"18px" }}>Loading floor data...</div>
      <div style={{ width:"200px", height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ width:"60%", height:"100%", background:"linear-gradient(90deg,rgba(255,100,0,0.8),rgba(255,180,50,1))", borderRadius:"2px", animation:"shimmer 1.2s infinite" }} />
      </div>
    </div>
  );

  if (fetchError || !panoramaUrl) return (
    <div style={{ height:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px" }}>
      <div style={{ fontSize:"48px" }}>⚠️</div>
      <h2 style={{ color:"white" }}>Floor Unavailable</h2>
      <p style={{ color:"#666", textAlign:"center", maxWidth:"400px" }}>{fetchError || "Panorama not uploaded yet."}</p>
      <button onClick={() => navigate(-1)} style={{ padding:"10px 24px", background:"#333", color:"white", border:"none", borderRadius:"8px", cursor:"pointer" }}>← Go Back</button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:"relative", overflow:"hidden", background:"#000", height:"100vh" }}>
      <style>{`
        /* ── PSV overrides ── */
        .psv-loader { display: none !important; }

        /* ── Unit markers ── */
        .unit-marker {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 22px;
          font-weight: 700; font-size: 13px;
          color: white; cursor: pointer;
          white-space: nowrap; letter-spacing: 0.3px;
          transition: transform 0.18s;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.15), 0 4px 16px var(--glow);
          animation: markerPulse 2.5s ease-in-out infinite;
        }
        .unit-marker:hover { transform: scale(1.08); }
        .unit-marker-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; opacity: 0.9;
        }
        @keyframes markerPulse {
          0%,100% { box-shadow: 0 0 0 2px rgba(255,255,255,0.1), 0 4px 12px var(--glow); }
          50%     { box-shadow: 0 0 0 4px rgba(255,255,255,0.2), 0 4px 28px var(--glow), 0 0 50px var(--glow); }
        }

        /* ── Loader ── */
        .floor-loader { transition: opacity 0.6s ease-out; }
        .floor-loader.hidden { opacity: 0; pointer-events: none; }
        .progress-bar-fill { transition: width 0.25s ease-out; }

        /* ── Status popup ── */
        .status-popup-overlay {
          position: fixed; inset: 0; z-index: 400;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
          z-index: 999;
        }
        .status-popup {
          background: #111; border-radius: 20px;
          padding: 28px 32px; min-width: 300px; max-width: 360px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.8);
          animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(24px); opacity:0 } to { transform:translateY(0); opacity:1 } }

        /* ── Legend ── */
        .floor-legend {
          position: absolute; bottom: 20px; left: 20px;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 10px 14px;
          display: flex; gap: 14px; z-index: 20;
        }
        .legend-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(255,255,255,0.6);
          white-space: nowrap;
        }
        .legend-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
        }
      `}</style>

      {/* ── Loading overlay ── */}
      <div className={`floor-loader${isLoaded ? " hidden" : ""}`} style={{
        position:"absolute", inset:0, zIndex:20,
        background:"linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 50%,#0a0a0a 100%)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,100,0,0.2)", borderRadius:"20px", padding:"40px 60px", minWidth:"320px" }}>
          <div style={{ fontSize:"52px", lineHeight:1 }}>🏠</div>
          <div style={{ color:"rgba(255,100,0,1)", fontSize:"56px", fontWeight:"bold", lineHeight:1, minWidth:"130px", textAlign:"center" }}>{loadProgress}%</div>
          <div style={{ width:"100%", height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px", overflow:"hidden" }}>
            <div className="progress-bar-fill" style={{ width:`${loadProgress}%`, height:"100%", background:"linear-gradient(90deg,rgba(255,100,0,0.8),rgba(255,180,50,1))", borderRadius:"2px" }} />
          </div>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"12px", letterSpacing:"1px", textTransform:"uppercase" }}>
            {loadProgress < 30 ? "Initializing..." : loadProgress < 60 ? "Loading floor plan..." : loadProgress < 90 ? "Processing image..." : loadProgress < 100 ? "Almost ready..." : "✓ Ready!"}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{
        padding:"10px 20px", background:"rgba(0,0,0,0.75)",
        backdropFilter:"blur(10px)", color:"#fff",
        zIndex:999, position:"relative",
        display:"flex", alignItems:"center", gap:"15px",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        opacity: isLoaded ? 1 : 0, transition:"opacity 0.5s",
      }}>
        <button onClick={handleBackClick} style={{ background:"rgba(255,100,0,0.15)", border:"1px solid rgba(255,100,0,0.4)", color:"#fff", padding:"6px 16px", borderRadius:"20px", cursor:"pointer", fontSize:"14px" }}>
          ← Back to Building
        </button>
        <h2 style={{ margin:0, letterSpacing:"2px", fontSize:"18px" }}>
          🏠 {blockName} — Click a unit to explore
        </h2>
      </div>

      {/* ── PSV container ── */}
      <div ref={containerRef} style={{ width:"100%", height:"calc(100vh - 50px)", position:"relative", zIndex:999 }} />

      {/* ── Legend ── */}
      {isLoaded && (
        <div className="floor-legend">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="legend-item">
              <div className="legend-dot" style={{ background: cfg.color }} />
              {cfg.label}
            </div>
          ))}
        </div>
      )}

      {/* ── Unit label (on marker click zoom) ── */}
      <div ref={labelRef} style={{
        position:"absolute", bottom:"80px", left:"50%", transform:"translateX(-50%)",
        color:"white", fontSize:"32px", fontWeight:"bold",
        opacity:0, zIndex:8, letterSpacing:"4px",
        textShadow:"0 0 20px rgba(255,100,0,0.9)",
        transition:"opacity 0.3s", pointerEvents:"none",
      }} />

      {/* ── Status popup (non-available units) ── */}
      {popup && (
        <div className="status-popup-overlay" onClick={() => setPopup(null)}>
          <div className="status-popup" onClick={e => e.stopPropagation()}>

            {/* Close */}
            <button onClick={() => setPopup(null)} style={{ position:"absolute", top:"14px", right:"16px", background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:"20px", cursor:"pointer", lineHeight:1 }}>×</button>

            {/* Unit name */}
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"6px" }}>Unit</div>
            <div style={{ color:"white", fontSize:"22px", fontWeight:"800", marginBottom:"18px" }}>{popup.label}</div>

            {/* Status badge */}
            {(() => {
              const cfg = getStatus(popup.status);
              return (
                <div style={{ display:"flex", alignItems:"center", gap:"10px", background: cfg.color + "18", border:`1px solid ${cfg.color}44`, borderRadius:"12px", padding:"12px 16px", marginBottom:"22px" }}>
                  <div style={{ width:"12px", height:"12px", borderRadius:"50%", background: cfg.color, flexShrink:0, boxShadow:`0 0 8px ${cfg.color}` }} />
                  <div>
                    <div style={{ color: cfg.color, fontWeight:"700", fontSize:"15px" }}>{cfg.label}</div>
                    <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"12px", marginTop:"2px" }}>
                      {cfg.label === "Pre-Booked" ? "This unit has a pending reservation." :
                       cfg.label === "Booked"     ? "This unit is fully booked." :
                       cfg.label === "Sold"       ? "This unit has been sold." :
                       "This unit is currently unavailable."}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {/* Still allow viewing unit details */}
              <button
                onClick={() => { setPopup(null); navigate(`/unit/${popup.plotId}`); }}
                style={{ padding:"12px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"white", borderRadius:"10px", cursor:"pointer", fontSize:"14px", fontWeight:"600", transition:"background 0.2s" }}
                onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.07)"}
              >
                View Unit Details →
              </button>

              <button
                onClick={() => setPopup(null)}
                style={{ padding:"11px", background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.4)", borderRadius:"10px", cursor:"pointer", fontSize:"13px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page fade overlay ── */}
      <div ref={overlayRef} style={{ position:"fixed", inset:0, background:"black", opacity:1, pointerEvents:"none", zIndex:500 }} />
    </div>
  );
};

export default FloorPlanPage;
