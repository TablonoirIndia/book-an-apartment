import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

import { apiUrl, imgUrl } from "../apiUrl";

// DB stores DEGREES → PSV needs RADIANS
const toRad = (deg) => parseFloat((deg * (Math.PI / 180)).toFixed(6));

const API_BASE = `${apiUrl}/api`;


const ApartmentViewer = () => {
  const { masterPlanId } = useParams(); // Route: /apartment-view/:masterPlanId
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const overlayRef = useRef(null);
  const labelRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [panoramaUrl, setPanoramaUrl] = useState(null);
  const [hotspots, setHotspots] = useState(null); // null = not fetched yet
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // ── Step 1: Fetch hotspots + panorama from API ─────────────────────
  useEffect(() => {
    if (!masterPlanId) {
      setFetchError("No master_plan_id in URL.");
      setIsFetching(false);
      return;
    }

    const fetchAll = async () => {
      try {
        // 1. Get hotspots
        const hotspotRes = await fetch(
          `${API_BASE}/hotspots?master_plan_id=${masterPlanId}`,
          { headers: { Accept: "application/json" } },
        );
        if (!hotspotRes.ok)
          throw new Error(`Hotspots API error ${hotspotRes.status}`);
        const hotspotData = await hotspotRes.json();
        setHotspots(hotspotData);

        // 2. Get master plan panorama URL
        const planRes = await fetch(`${API_BASE}/master-plan/${masterPlanId}`, {
          headers: { Accept: "application/json" },
        });
        if (!planRes.ok)
          throw new Error(`Master plan API error ${planRes.status}`);
        const planData = await planRes.json();

        if (!planData.panorama_url)
          throw new Error("No panorama uploaded for this master plan.");
        setPanoramaUrl(planData.panorama_url);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAll();
  }, [masterPlanId]);

  // ── Step 2: Init PSV viewer once data is ready ─────────────────────
  useEffect(() => {
    if (!panoramaUrl || !hotspots || !containerRef.current) return;

    // Fake progress 0 → 90
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 8;
      if (current >= 90) {
        current = 90;
        clearInterval(intervalRef.current);
      }
      setLoadProgress(Math.round(current));
    }, 200);

    // Build PSV markers — convert degrees → radians
    const psvMarkers = hotspots.map((h) => ({
      id: `floor-${h.id}`,
      position: {
        yaw: toRad(parseFloat(h.yaw)),
        pitch: toRad(parseFloat(h.pitch)),
      },
      html: `<div class="floor-marker">🏢 ${h.label}</div>`,
      size: { width: 130, height: 42 },
      tooltip: `Enter ${h.label}`,
      data: {
        hotspotId: h.id,
        blockId: h.block_id,
        label: h.label,
        yawRad: toRad(parseFloat(h.yaw)),
        pitchRad: toRad(parseFloat(h.pitch)),
      },
    }));

    // viewerRef.current = new Viewer({
    //   container: containerRef.current,
    //   panorama: panoramaUrl,
    //   defaultZoomLvl: 50,
    //   mousewheelCtrlKey: false,
    //   loadingImg: null,
    //   loadingTxt: "",
    //   plugins: [[MarkersPlugin, { markers: psvMarkers }]],
    // });

    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: panoramaUrl,
      defaultZoomLvl: 50,
      mousewheelCtrlKey: false,
      loadingImg: null,
      loadingTxt: "",     
     navbar: ["zoom", "move", "caption", "fullscreen"],
      plugins: [[MarkersPlugin, { markers: psvMarkers }]],
    });

    // ── Ready ─────────────────────────────────────────────────────────
    viewerRef.current.addEventListener("ready", () => {
      clearInterval(intervalRef.current);
      setLoadProgress(100);
      setTimeout(() => setIsLoaded(true), 700);

      // Swing effect
      let angle = 0,
        isInteracting = false,
        resumeTimeout = null;
      const swing = () => {
        if (!isInteracting) {
          angle += 0.003;
          viewerRef.current.rotate({ yaw: Math.sin(angle) * 0.08, pitch: 0 });
        }
        viewerRef.current._rafId = requestAnimationFrame(swing);
      };
      viewerRef.current._rafId = requestAnimationFrame(swing);

      const onStart = () => {
        isInteracting = true;
        clearTimeout(resumeTimeout);
      };
      const onEnd = () => {
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
          isInteracting = false;
        }, 2000);
      };
      const el = containerRef.current;
      el.addEventListener("mousedown", onStart, { passive: true });
      el.addEventListener("mouseup", onEnd, { passive: true });
      el.addEventListener("touchstart", onStart, { passive: true });
      el.addEventListener("touchend", onEnd, { passive: true });

      viewerRef.current._cleanup = () => {
        cancelAnimationFrame(viewerRef.current._rafId);
        clearTimeout(resumeTimeout);
        el.removeEventListener("mousedown", onStart);
        el.removeEventListener("mouseup", onEnd);
        el.removeEventListener("touchstart", onStart);
        el.removeEventListener("touchend", onEnd);
      };
    });

    // ── Marker click → fly in → navigate ────────────────────────────
    const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);

    markersPlugin.addEventListener("select-marker", ({ marker }) => {
      const { blockId, label, yawRad, pitchRad } = marker.data;

      // Hide all markers
      hotspots.forEach((h) => {
        try {
          markersPlugin.updateMarker({ id: `floor-${h.id}`, opacity: 0 });
        } catch (e) {}
      });

      // Show label
      if (labelRef.current) {
        labelRef.current.textContent = label;
        labelRef.current.style.opacity = "1";
      }

      // Fly-in → navigate to /floor/:blockId
      viewerRef.current
        .animate({ yaw: yawRad, pitch: pitchRad, zoom: 55, speed: "4rpm" })
        .then(() =>
          viewerRef.current.animate({
            yaw: yawRad,
            pitch: pitchRad,
            zoom: 100,
            speed: "20rpm",
          }),
        )
        .then(() => {
          if (overlayRef.current) {
            overlayRef.current.style.transition = "opacity 0.4s ease-in";
            overlayRef.current.style.opacity = "1";
          }
          setTimeout(() => navigate(`/floor/${blockId}`), 450);
        });
    });

    return () => {
      clearInterval(intervalRef.current);
      viewerRef.current?._cleanup?.();
      viewerRef.current?.destroy();
    };
  }, [panoramaUrl, hotspots]);

  // ── Fetching spinner ───────────────────────────────────────────────
  if (isFetching) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <style>{`
          @keyframes shimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
        <div style={{ fontSize: "48px" }}>🏢</div>
        <div style={{ color: "white", fontSize: "18px" }}>
          Loading tour data...
        </div>
        <div
          style={{
            width: "200px",
            height: "4px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "60%",
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(255,140,0,0.8), rgba(255,200,50,1))",
              borderRadius: "2px",
              animation: "shimmer 1.2s infinite",
            }}
          />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (fetchError || !panoramaUrl) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <h2 style={{ color: "white" }}>Tour Unavailable</h2>
        <p style={{ color: "#666", textAlign: "center", maxWidth: "400px" }}>
          {fetchError || "Panorama not uploaded yet for this master plan."}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 24px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────
  return (
    <div
      style={{ position: "relative", overflow: "hidden", background: "#000" }}
    >
      <style>{`
        .floor-marker {
          background: rgba(255,140,0,0.92); color: white;
          padding: 8px 18px; border-radius: 20px;
          font-weight: bold; font-size: 14px;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 0 20px rgba(255,140,0,0.7), 0 0 40px rgba(255,140,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: pulse 2s infinite;
        }
        .floor-marker:hover {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(255,140,0,1);
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 10px rgba(255,140,0,0.6); }
          50%     { box-shadow: 0 0 25px rgba(255,140,0,1), 0 0 50px rgba(255,140,0,0.4); }
        }
        .loader-screen          { transition: opacity 0.6s ease-out; }
        .loader-screen.hidden   { opacity: 0; pointer-events: none; }
        .progress-bar-fill      { transition: width 0.25s ease-out; }
      `}</style>

      {/* Loading screen */}
      <div
        className={`loader-screen${isLoaded ? " hidden" : ""}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 50%,#0a0a0a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,140,0,0.2)",
            borderRadius: "20px",
            padding: "40px 60px",
            minWidth: "320px",
          }}
        >
          <div style={{ fontSize: "52px", lineHeight: 1 }}>🏢</div>
          <div
            style={{
              color: "rgba(255,140,0,1)",
              fontSize: "56px",
              fontWeight: "bold",
              lineHeight: 1,
              minWidth: "130px",
              textAlign: "center",
            }}
          >
            {loadProgress}%
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${loadProgress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg,rgba(255,140,0,0.8),rgba(255,200,50,1))",
                borderRadius: "2px",
              }}
            />
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "12px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {loadProgress < 30 && "Initializing..."}
            {loadProgress >= 30 &&
              loadProgress < 60 &&
              "Downloading panorama..."}
            {loadProgress >= 60 && loadProgress < 90 && "Processing image..."}
            {loadProgress >= 90 && loadProgress < 100 && "Almost ready..."}
            {loadProgress === 100 && "✓ Ready!"}
          </div>
        </div>
      </div>

      {/* Header */}
      <h2
        style={{
          padding: "10px",
          margin: 0,
          background: "#111",
          color: "#fff",
          zIndex: 5,
          position: "relative",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        Virtual Tour — Click a floor to explore
      </h2>

      {/* Panorama */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "calc(100vh - 50px)" }}
      />

      {/* Floor label */}
      <div
        ref={labelRef}
        style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "32px",
          fontWeight: "bold",
          opacity: 0,
          zIndex: 8,
          letterSpacing: "4px",
          textShadow: "0 0 20px rgba(255,140,0,0.9)",
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />

      {/* Fade overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "black",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    </div>
  );
};

export default ApartmentViewer;
