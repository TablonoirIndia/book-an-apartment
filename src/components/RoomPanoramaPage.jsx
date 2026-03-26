import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

const RoomPanoramaPage = () => {
  const { plotId, roomId } = useParams();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const overlayRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [unit, setUnit] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const unitRes = await fetch(`${API_BASE}/unit/${plotId}`, {
          headers: { Accept: "application/json" },
        });
        if (!unitRes.ok) throw new Error("Unit not found");
        const unitData = await unitRes.json();
        setUnit(unitData);

        const room = unitData.rooms?.find((r) => r.id === parseInt(roomId));
        if (!room) throw new Error("Room not found");
        setRoom(room);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchAll();
  }, [plotId, roomId]);

  useEffect(() => {
    if (!room?.panorama_url || !containerRef.current) return;

    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: room.panorama_url,
      defaultZoomLvl: 50,
      mousewheelCtrlKey: false,
      loadingImg: null,
      loadingTxt: "",
      navbar: ["zoom", "move", "caption", "fullscreen"],
      plugins: [[MarkersPlugin, { markers: [] }]],
    });

    viewerRef.current.addEventListener("ready", () => {
      setIsLoaded(true);
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
    });

    return () => {
      viewerRef.current?.destroy();
    };
  }, [room]);

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
        Loading room...
      </div>
    );

  if (fetchError || !room)
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
        <h2 style={{ color: "white" }}>{fetchError || "Room not found"}</h2>
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

  return (
    <div
      style={{ position: "relative", overflow: "hidden", background: "#000" }}
    >
      <style>{`.psv-loader { display:none !important; }`}</style>

      {/* Header */}
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
          🚪 {room.room_label}
        </span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          Unit {unit?.plot_number}
        </span>

        {/* Other rooms quick-nav */}
        {unit?.rooms?.length > 1 && (
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            {unit.rooms
              .filter((r) => r.id !== parseInt(roomId))
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/unit/${plotId}/room/${r.id}`)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.7)",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {r.room_label}
                </button>
              ))}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "calc(100vh - 50px)",
          zIndex: 999,
          position: "relative",
        }}
      />

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

export default RoomPanoramaPage;
