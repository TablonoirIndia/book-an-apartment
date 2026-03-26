import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

const GalleryPanoramaPage = () => {
  const { plotId, index } = useParams(); // index = which gallery image
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const overlayRef = useRef(null);

  const [unit, setUnit] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentIdx = parseInt(index) || 0;

  // ── Fetch unit ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/unit/${plotId}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Unit not found");
        return r.json();
      })
      .then((data) => setUnit(data))
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsFetching(false));
  }, [plotId]);

  // ── Init PSV for current gallery image ─────────────────────
  useEffect(() => {
    if (!unit || !containerRef.current) return;

    const gallery = unit.gallery_images || [];
    if (!gallery[currentIdx]) return;

    // Destroy previous
    viewerRef.current?._cleanup?.();
    viewerRef.current?.destroy();
    setIsLoaded(false);

    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: gallery[currentIdx],
      defaultZoomLvl: 50,
      mousewheelCtrlKey: false,
      loadingImg: null,
      loadingTxt: "",
      navbar: ["zoom", "move", "caption", "fullscreen"],
      plugins: [[MarkersPlugin, { markers: [] }]],
    });

    viewerRef.current.addEventListener("ready", () => {
      setIsLoaded(true);

      // Gentle auto-rotate
      let angle = 0,
        isInteracting = false;
      const swing = () => {
        if (!isInteracting) {
          angle += 0.002;
          viewerRef.current.rotate({ yaw: Math.sin(angle) * 0.05, pitch: 0 });
        }
        viewerRef.current._rafId = requestAnimationFrame(swing);
      };
      viewerRef.current._rafId = requestAnimationFrame(swing);

      const el = containerRef.current;
      const onStart = () => {
        isInteracting = true;
      };
      const onEnd = () => {
        setTimeout(() => {
          isInteracting = false;
        }, 2000);
      };
      el.addEventListener("mousedown", onStart, { passive: true });
      el.addEventListener("touchstart", onStart, { passive: true });
      el.addEventListener("mouseup", onEnd, { passive: true });
      el.addEventListener("touchend", onEnd, { passive: true });

      viewerRef.current._cleanup = () => {
        cancelAnimationFrame(viewerRef.current._rafId);
        el.removeEventListener("mousedown", onStart);
        el.removeEventListener("touchstart", onStart);
        el.removeEventListener("mouseup", onEnd);
        el.removeEventListener("touchend", onEnd);
      };
    });

    return () => {
      viewerRef.current?._cleanup?.();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [unit, currentIdx]);

  // ── Entry fade-in ──────────────────────────────────────────
  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.style.opacity = "1";
    overlayRef.current.style.transition = "none";
    const t = setTimeout(() => {
      overlayRef.current.style.transition = "opacity 0.7s ease-out";
      overlayRef.current.style.opacity = "0";
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const navigateToIndex = (idx) => {
    if (!overlayRef.current) return;
    overlayRef.current.style.transition = "opacity 0.3s ease-in";
    overlayRef.current.style.opacity = "1";
    setTimeout(() => navigate(`/unit/${plotId}/gallery/${idx}`), 320);
  };

  const handleBack = () => {
    if (overlayRef.current) {
      overlayRef.current.style.transition = "opacity 0.4s ease-in";
      overlayRef.current.style.opacity = "1";
    }
    setTimeout(() => navigate(`/unit/${plotId}`), 450);
  };

  if (isFetching)
    return (
      <div
        style={{
          height: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Loading gallery...
      </div>
    );

  if (fetchError || !unit)
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
        <h2 style={{ color: "white" }}>{fetchError || "Unit not found"}</h2>
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

  const gallery = unit.gallery_images || [];
  const total = gallery.length;

  if (!total)
    return (
      <div
        style={{
          height: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        No gallery images for this unit.
      </div>
    );

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#000",
        height: "100vh",
      }}
    >
      <style>{`.psv-loader { display:none !important; }`}</style>

      {/* ── Header ── */}
      <div
        style={{
          padding: "10px 20px",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          zIndex: 999,
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: "rgba(201,169,110,0.15)",
            border: "1px solid rgba(201,169,110,0.4)",
            color: "#fff",
            padding: "6px 16px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Unit
        </button>

        <span style={{ fontWeight: "bold", fontSize: "16px" }}>
          🌐 Unit {unit.plot_number} — Gallery
        </span>

        {/* ── Image counter ── */}
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          {currentIdx + 1} / {total}
        </span>

        {/* ── Prev / Next ── */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigateToIndex((currentIdx - 1 + total) % total)}
            disabled={total <= 1}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              padding: "6px 14px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "13px",
              opacity: total <= 1 ? 0.3 : 1,
            }}
          >
            ‹ Prev
          </button>
          <button
            onClick={() => navigateToIndex((currentIdx + 1) % total)}
            disabled={total <= 1}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              padding: "6px 14px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "13px",
              opacity: total <= 1 ? 0.3 : 1,
            }}
          >
            Next ›
          </button>
        </div>
      </div>

      {/* ── PSV Panorama ── */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "calc(100vh - 50px)",
          zIndex: 999,
          position: "relative",
        }}
      />

      {/* ── Thumbnail strip (bottom) ── */}
      {isLoaded && total > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 8,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "8px 12px",
            display: "flex",
            gap: "8px",
            maxWidth: "90vw",
            overflowX: "auto",
          }}
        >
          {gallery.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Gallery ${idx + 1}`}
              onClick={() => navigateToIndex(idx)}
              style={{
                width: "60px",
                height: "38px",
                objectFit: "cover",
                borderRadius: "6px",
                cursor: "pointer",
                flexShrink: 0,
                border:
                  idx === currentIdx
                    ? "2px solid #c9a96e"
                    : "2px solid rgba(255,255,255,0.15)",
                transition: "border-color 0.2s, transform 0.15s",
                transform: idx === currentIdx ? "scale(1.1)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}

      {/* Fade overlay */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "black",
          opacity: 1,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    </div>
  );
};

export default GalleryPanoramaPage;
