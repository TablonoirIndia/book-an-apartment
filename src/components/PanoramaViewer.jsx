import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

import floorsData from "../data/floorsData";

const PanoramaViewer = () => {
  const { floorId, roomId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // Find the correct room from floorsData
  const floor = floorsData[floorId];
  const room = floor?.rooms.find((r) => r.id === parseInt(roomId));
  const imageUrl = room?.panorama;

  useEffect(() => {
    // If room not found or container not ready, stop
    if (!containerRef.current || !imageUrl) return;

    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: imageUrl,
      plugins: [
        [MarkersPlugin, {
          markers: [
            {
              id: "marker-1",
              position: { yaw: "45deg", pitch: "0deg" },
              html: "📍",
              size: { width: 40, height: 40 },
              tooltip: "Click me!",
              data: { info: "This is a custom hotspot" },
            },
          ],
        }],
      ],
    });

    const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);
    markersPlugin.addEventListener("select-marker", ({ marker }) => {
      alert(marker.data.info);
    });

    return () => viewerRef.current?.destroy();
  }, [imageUrl]);

  // Show message if room not found
  if (!room) return <p>Room not found</p>;

  return (
    <div>
      {/* Back button */}
      <div style={{ padding: '10px 20px', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => navigate(`/floor/${floorId}`)}>← Back to Floor Plan</button>
        <span style={{ fontWeight: 'bold' }}>{room.name}</span>
      </div>

      <div ref={containerRef} style={{ width: "100%", height: "calc(100vh - 50px)" }} />
    </div>
  );
};

export default PanoramaViewer;