import { useState, useRef, useEffect, Suspense } from "react";

// ─── COLOR SYSTEM ───────────────────────────────────────────────────────────
const theme = {
  bg: "#070B10",
  surface: "#0D1420",
  card: "#111827",
  border: "#1E2D45",
  accent: "#C8A96E",
  accentDim: "#8B6F3E",
  gold: "#F0C97A",
  text: "#E8EDF5",
  muted: "#5A6A80",
  success: "#2ECC71",
  warning: "#F39C12",
  danger: "#E74C3C",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const FLOORS = [
  { id: 1, label: "Ground Floor", units: 8, available: 3 },
  { id: 2, label: "2nd Floor", units: 8, available: 5 },
  { id: 3, label: "3rd Floor", units: 8, available: 2 },
  { id: 4, label: "4th Floor", units: 6, available: 6 },
  { id: 5, label: "5th Floor", units: 6, available: 4 },
  { id: 6, label: "Penthouse", units: 2, available: 1 },
];

const UNIT_TYPES = {
  studio: { label: "Studio", beds: 0, baths: 1, sqft: 450 },
  "1bhk": { label: "1 BHK", beds: 1, baths: 1, sqft: 650 },
  "2bhk": { label: "2 BHK", beds: 2, baths: 2, sqft: 950 },
  "3bhk": { label: "3 BHK", beds: 3, baths: 2, sqft: 1350 },
};

function generateUnits(floorId) {
  const types = ["studio", "1bhk", "2bhk", "3bhk", "2bhk", "1bhk", "2bhk", "3bhk"];
  const statuses = ["available", "available", "booked", "available", "reserved", "booked", "available", "available"];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `F${floorId}-U${i + 1}`,
    unit: `${floorId}0${i + 1}`,
    type: types[i],
    status: statuses[i],
    price: Math.round((2500000 + i * 300000 + floorId * 200000) / 100000) * 100000,
    floor: floorId,
    facing: ["East", "West", "North", "South", "East", "West", "North", "South"][i],
    amenities: ["Gym", "Pool", "Parking", "Balcony"].slice(0, Math.floor(Math.random() * 3) + 2),
  }));
}

// ─── 3D BUILDING CANVAS ───────────────────────────────────────────────────────
function Building3D({ selectedFloor, onFloorClick, hoveredFloor, onFloorHover }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotationRef = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const autoRotate = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth * 2;
    let H = canvas.height = canvas.offsetHeight * 2;

    const FLOOR_COUNT = 6;
    const FLOOR_H = 55;
    const BUILDING_W = 180;
    const BUILDING_D = 120;

    function project(x, y, z, rot) {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const rx = x * cos - z * sin;
      const rz = x * sin + z * cos;
      const scale = 900 / (900 + rz);
      return {
        sx: W / 2 + rx * scale,
        sy: H * 0.72 - y * scale,
        scale,
      };
    }

    function drawFace(points, fillColor, strokeColor, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(points[0].sx, points[0].sy);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].sx, points[i].sy);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    function getFloorColor(floorIdx, face, isSelected, isHovered) {
      const base = face === "front" ? 0.85 : face === "side" ? 0.65 : 0.4;
      if (isSelected) return face === "front" ? `rgba(200,169,110,${base})` : `rgba(160,120,60,${base})`;
      if (isHovered) return face === "front" ? `rgba(150,180,220,${base})` : `rgba(100,130,170,${base})`;
      const r = 20 + floorIdx * 4, g = 35 + floorIdx * 3, b = 60 + floorIdx * 5;
      return `rgba(${r},${g},${b},${base})`;
    }

    function drawWindows(ctx, p1, p2, p3, p4, floorIdx, face) {
      if (face !== "front" && face !== "side") return;
      const cols = face === "front" ? 4 : 3;
      const rows = 2;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const tx = (c + 0.5) / cols;
          const ty = (r + 0.5) / rows;
          const wx = p1.sx + (p2.sx - p1.sx) * tx + (p4.sx - p1.sx) * ty;
          const wy = p1.sy + (p2.sy - p1.sy) * tx + (p4.sy - p1.sy) * ty;
          const ws = 10 * p1.scale;
          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = Math.random() > 0.3 ? "#8BBFEA" : "#2A3F5C";
          ctx.beginPath();
          ctx.rect(wx - ws / 2, wy - ws / 1.5, ws, ws * 1.3);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const rot = rotationRef.current;

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75);
      sky.addColorStop(0, "#040810");
      sky.addColorStop(1, "#0D1E35");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Ground
      const grd = ctx.createLinearGradient(0, H * 0.7, 0, H);
      grd.addColorStop(0, "#0A1520");
      grd.addColorStop(1, "#050C18");
      ctx.fillStyle = grd;
      ctx.fillRect(0, H * 0.7, W, H * 0.3);

      // Ground reflection line
      ctx.strokeStyle = "rgba(200,169,110,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 20]);
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H * 0.72);
      ctx.lineTo(W * 0.9, H * 0.72);
      ctx.stroke();
      ctx.setLineDash([]);

      // Stars
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
        const sy = (Math.cos(i * 97.3) * 0.5 + 0.5) * H * 0.6;
        const r = (Math.sin(i * 53) * 0.5 + 0.5) * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${0.3 + Math.sin(Date.now() / 1000 + i) * 0.2})`;
        ctx.fill();
      }

      // Draw building floors
      for (let f = 0; f < FLOOR_COUNT; f++) {
        const floorId = f + 1;
        const y0 = f * FLOOR_H;
        const y1 = (f + 1) * FLOOR_H;
        const isSelected = selectedFloor === floorId;
        const isHovered = hoveredFloor === floorId;

        const hw = BUILDING_W / 2, hd = BUILDING_D / 2;

        const corners = [
          { x: -hw, z: -hd }, { x: hw, z: -hd },
          { x: hw, z: hd }, { x: -hw, z: hd },
        ];

        const topPts = corners.map(c => project(c.x, y1, c.z, rot));
        const botPts = corners.map(c => project(c.x, y0, c.z, rot));

        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const frontFacing = -sin > 0;
        const sideFacing = cos > 0;

        // Top face
        drawFace(topPts, isSelected ? "rgba(200,169,110,0.5)" : "rgba(20,40,70,0.8)", theme.border);

        // Front/Back
        if (frontFacing) {
          drawFace(
            [botPts[0], botPts[1], topPts[1], topPts[0]],
            getFloorColor(f, "front", isSelected, isHovered),
            isSelected ? theme.accent : isHovered ? "#5A8AB0" : theme.border
          );
        } else {
          drawFace(
            [botPts[2], botPts[3], topPts[3], topPts[2]],
            getFloorColor(f, "back", isSelected, isHovered),
            theme.border
          );
        }

        // Left/Right
        if (sideFacing) {
          drawFace(
            [botPts[3], botPts[0], topPts[0], topPts[3]],
            getFloorColor(f, "side", isSelected, isHovered),
            isSelected ? theme.accentDim : theme.border
          );
        } else {
          drawFace(
            [botPts[1], botPts[2], topPts[2], topPts[1]],
            getFloorColor(f, "side", isSelected, isHovered),
            theme.border
          );
        }

        // Highlight edge if selected/hovered
        if (isSelected || isHovered) {
          ctx.save();
          ctx.strokeStyle = isSelected ? theme.gold : "#7AAFD4";
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.shadowColor = isSelected ? theme.gold : "#7AAFD4";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          if (frontFacing) {
            ctx.moveTo(botPts[0].sx, botPts[0].sy);
            ctx.lineTo(botPts[1].sx, botPts[1].sy);
            ctx.lineTo(topPts[1].sx, topPts[1].sy);
            ctx.lineTo(topPts[0].sx, topPts[0].sy);
            ctx.closePath();
          }
          ctx.stroke();
          ctx.restore();
        }

        // Floor label
        if (frontFacing) {
          const midTop = { sx: (topPts[0].sx + topPts[1].sx) / 2, sy: (topPts[0].sy + topPts[1].sy) / 2 };
          const midBot = { sx: (botPts[0].sx + botPts[1].sx) / 2, sy: (botPts[0].sy + botPts[1].sy) / 2 };
          const midY = (midTop.sy + midBot.sy) / 2;
          const midX = (midTop.sx + midBot.sx) / 2;
          ctx.save();
          ctx.font = `bold ${24 * topPts[0].scale}px 'Courier New'`;
          ctx.fillStyle = isSelected ? theme.gold : isHovered ? "#C8E0F8" : "rgba(180,200,230,0.6)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`F${floorId}`, midX, midY);
          ctx.restore();
        }
      }

      // Roof decorative antenna
      const roofTop = project(0, FLOOR_COUNT * FLOOR_H + 40, 0, rot);
      const roofBot = project(0, FLOOR_COUNT * FLOOR_H, 0, rot);
      ctx.save();
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(roofBot.sx, roofBot.sy);
      ctx.lineTo(roofTop.sx, roofTop.sy);
      ctx.stroke();
      // Blinking light
      ctx.beginPath();
      ctx.arc(roofTop.sx, roofTop.sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,100,100,${0.5 + Math.sin(Date.now() / 400) * 0.5})`;
      ctx.fill();
      ctx.restore();
    }

    function getFloorFromMouse(mx, my, rot) {
      const FLOOR_H_px = 55;
      const BUILDING_W = 180, BUILDING_D = 120;
      // Simplified hit test — check Y range for each floor
      for (let f = FLOOR_COUNT - 1; f >= 0; f--) {
        const y0 = f * FLOOR_H_px, y1 = (f + 1) * FLOOR_H_px;
        const hw = BUILDING_W / 2, hd = BUILDING_D / 2;
        const cos = Math.cos(rot), sin = Math.sin(rot);
        const pts = [
          [-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]
        ].map(([x, z]) => {
          const rx = x * cos - z * sin, rz = x * sin + z * cos;
          const sc = 900 / (900 + rz);
          return { sx: W / 2 + rx * sc, sy: H * 0.72 - y0 * sc };
        });
        const avgY0 = pts.reduce((a, p) => a + p.sy, 0) / 4;
        const ptsTop = [
          [-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]
        ].map(([x, z]) => {
          const rx = x * cos - z * sin, rz = x * sin + z * cos;
          const sc = 900 / (900 + rz);
          return { sx: W / 2 + rx * sc, sy: H * 0.72 - y1 * sc };
        });
        const avgY1 = ptsTop.reduce((a, p) => a + p.sy, 0) / 4;
        const avgX = pts.reduce((a, p) => a + p.sx, 0) / 4;
        const spanX = 200 * 900 / 900;
        if (mx * 2 > avgX - spanX && mx * 2 < avgX + spanX &&
          my * 2 > avgY1 && my * 2 < avgY0) {
          return f + 1;
        }
      }
      return null;
    }

    function loop() {
      if (autoRotate.current) rotationRef.current += 0.004;
      draw();
      animRef.current = requestAnimationFrame(loop);
    }
    loop();

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (isDragging.current) {
        const dx = e.clientX - lastX.current;
        rotationRef.current += dx * 0.008;
        lastX.current = e.clientX;
        autoRotate.current = false;
      }
      const fl = getFloorFromMouse(mx, my, rotationRef.current);
      onFloorHover(fl);
    };
    const onMouseDown = (e) => {
      isDragging.current = true;
      lastX.current = e.clientX;
      autoRotate.current = false;
    };
    const onMouseUp = (e) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const fl = getFloorFromMouse(mx, my, rotationRef.current);
      if (fl) onFloorClick(fl);
      setTimeout(() => { autoRotate.current = true; }, 3000);
    };
    const onTouchStart = (e) => {
      isDragging.current = true;
      lastX.current = e.touches[0].clientX;
      autoRotate.current = false;
    };
    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - lastX.current;
      rotationRef.current += dx * 0.008;
      lastX.current = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      setTimeout(() => { autoRotate.current = true; }, 3000);
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("touchend", onTouchEnd);

    const ro = new ResizeObserver(() => {
      W = canvas.width = canvas.offsetWidth * 2;
      H = canvas.height = canvas.offsetHeight * 2;
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      ro.disconnect();
    };
  }, [selectedFloor, hoveredFloor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", cursor: "grab", display: "block" }}
    />
  );
}

// ─── SVG FLOORPLAN ────────────────────────────────────────────────────────────
function SVGFloorplan({ units, onUnitClick, selectedUnit }) {
  const COLS = 4, ROWS = 2;
  const UW = 110, UH = 90, GAP = 8, PAD = 20;

  const statusColor = { available: "#1E4D2E", booked: "#4D1E1E", reserved: "#4D3A1E" };
  const statusText = { available: theme.success, booked: theme.danger, reserved: theme.warning };

  return (
    <svg
      viewBox={`0 0 ${COLS * (UW + GAP) + PAD * 2} ${ROWS * (UH + GAP) + PAD * 2 + 30}`}
      style={{ width: "100%", maxWidth: 540, display: "block", margin: "0 auto" }}
    >
      {/* Compass */}
      <text x={PAD} y={18} fill={theme.accent} fontSize={11} fontFamily="monospace">▲ NORTH</text>

      {units.map((unit, i) => {
        const col = i % COLS, row = Math.floor(i / COLS);
        const x = PAD + col * (UW + GAP), y = 28 + row * (UH + GAP);
        const isSelected = selectedUnit?.id === unit.id;
        const sColor = statusColor[unit.status] || "#1A2A3A";
        const tColor = statusText[unit.status] || theme.muted;
        const info = UNIT_TYPES[unit.type];

        return (
          <g key={unit.id} onClick={() => unit.status === "available" && onUnitClick(unit)} style={{ cursor: unit.status === "available" ? "pointer" : "not-allowed" }}>
            <rect
              x={x} y={y} width={UW} height={UH} rx={4}
              fill={sColor}
              stroke={isSelected ? theme.gold : unit.status === "available" ? "#2E5540" : "#3A2020"}
              strokeWidth={isSelected ? 2.5 : 1}
              filter={isSelected ? "url(#glow)" : ""}
            />
            {/* Unit number */}
            <text x={x + 8} y={y + 18} fill={tColor} fontSize={13} fontWeight="bold" fontFamily="monospace">{unit.unit}</text>
            {/* Type */}
            <text x={x + 8} y={y + 34} fill={theme.text} fontSize={10} fontFamily="sans-serif" opacity={0.8}>{info.label}</text>
            {/* Sqft */}
            <text x={x + 8} y={y + 50} fill={theme.muted} fontSize={9} fontFamily="sans-serif">{info.sqft} sqft · {unit.facing}</text>
            {/* Price */}
            <text x={x + 8} y={y + 67} fill={theme.accent} fontSize={10} fontWeight="bold" fontFamily="monospace">
              ₹{(unit.price / 100000).toFixed(0)}L
            </text>
            {/* Status badge */}
            <rect x={x + UW - 56} y={y + UH - 22} width={50} height={16} rx={3} fill={tColor} opacity={0.15} />
            <text x={x + UW - 31} y={y + UH - 11} fill={tColor} fontSize={8} fontFamily="monospace" textAnchor="middle" textLength={40}>
              {unit.status.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ─── UNIT DETAILS PANEL ───────────────────────────────────────────────────────
function UnitPanel({ unit, onBook, onClose }) {
  if (!unit) return null;
  const info = UNIT_TYPES[unit.type];
  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 340,
      background: theme.surface, borderLeft: `1px solid ${theme.border}`,
      display: "flex", flexDirection: "column", zIndex: 100,
      fontFamily: "sans-serif", animation: "slideIn 0.3s ease",
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

      {/* Header */}
      <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 11, color: theme.muted, letterSpacing: 2, marginBottom: 4 }}>UNIT DETAILS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, fontFamily: "Georgia, serif" }}>#{unit.unit}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
      </div>

      {/* 3D Apartment Preview */}
      <div style={{ height: 160, background: "#070B10", position: "relative", overflow: "hidden" }}>
        <ApartmentMiniViewer unit={unit} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
          background: "linear-gradient(transparent, " + theme.surface + ")"
        }} />
        <div style={{
          position: "absolute", top: 8, right: 8, padding: "3px 8px",
          background: theme.accent, color: "#000", fontSize: 10, fontWeight: 700,
          borderRadius: 3, letterSpacing: 1
        }}>3D PREVIEW</div>
      </div>

      {/* Details */}
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Type", value: info.label },
            { label: "Floor", value: `${unit.floor}${unit.floor === 1 ? "st" : unit.floor === 2 ? "nd" : unit.floor === 3 ? "rd" : "th"}` },
            { label: "Area", value: `${info.sqft} sq.ft` },
            { label: "Facing", value: unit.facing },
            { label: "Bedrooms", value: info.beds || "Studio" },
            { label: "Bathrooms", value: info.baths },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: theme.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: 1.5, marginBottom: 4 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize: 14, color: theme.text, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: theme.muted, letterSpacing: 2, marginBottom: 10 }}>AMENITIES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {unit.amenities.map(a => (
              <span key={a} style={{
                padding: "4px 10px", background: "rgba(200,169,110,0.1)",
                border: `1px solid rgba(200,169,110,0.3)`, borderRadius: 20,
                fontSize: 11, color: theme.accent
              }}>{a}</span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ background: theme.card, borderRadius: 12, padding: 16, border: `1px solid ${theme.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: theme.muted, letterSpacing: 2, marginBottom: 4 }}>TOTAL PRICE</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: theme.gold, fontFamily: "Georgia, serif" }}>
            ₹{(unit.price / 100000).toFixed(0)} <span style={{ fontSize: 14, fontWeight: 400 }}>Lakhs</span>
          </div>
          <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>
            ₹{Math.round(unit.price / info.sqft).toLocaleString()} per sq.ft
          </div>
        </div>

        <button
          onClick={() => onBook(unit)}
          style={{
            width: "100%", padding: "14px 0", background: `linear-gradient(135deg, ${theme.accent}, ${theme.gold})`,
            border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
            color: "#0D0A05", letterSpacing: 1.5, fontFamily: "sans-serif"
          }}
        >
          BOOK THIS UNIT →
        </button>
      </div>
    </div>
  );
}

// ─── MINI 3D APARTMENT VIEWER ─────────────────────────────────────────────────
function ApartmentMiniViewer({ unit }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const W = canvas.width, H = canvas.height;
    let rot = 0.3;

    const info = UNIT_TYPES[unit.type];
    const rooms = [];
    // Generate rooms based on unit type
    const roomCount = (info.beds || 0) + 2; // beds + living + kitchen
    const roomW = 60, roomD = 50, roomH = 35;
    for (let i = 0; i < roomCount; i++) {
      rooms.push({ x: (i % 2) * (roomW + 5), z: Math.floor(i / 2) * (roomD + 5), w: roomW, d: roomD, h: roomH });
    }

    function project(x, y, z) {
      const cos = Math.cos(rot), sin = Math.sin(rot);
      const rx = x * cos - z * sin, rz = x * sin + z * cos;
      const sc = 400 / (400 + rz);
      return { sx: W / 2 + rx * sc, sy: H * 0.6 - y * sc };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#070B10");
      bg.addColorStop(1, "#0A1525");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      rooms.forEach((room, ri) => {
        const ox = room.x - 65, oz = room.z - 40;
        const corners = [
          [ox, oz], [ox + room.w, oz],
          [ox + room.w, oz + room.d], [ox, oz + room.d],
        ];
        const bot = corners.map(([x, z]) => project(x, 0, z));
        const top = corners.map(([x, z]) => project(x, room.h, z));

        const colors = ["#1A3050", "#152840", "#1E3860", "#182A45"];
        // Floor
        ctx.beginPath(); ctx.moveTo(bot[0].sx, bot[0].sy);
        bot.forEach(p => ctx.lineTo(p.sx, p.sy)); ctx.closePath();
        ctx.fillStyle = colors[ri % 4]; ctx.fill();
        ctx.strokeStyle = theme.border; ctx.lineWidth = 1; ctx.stroke();

        // Walls
        [[0, 1], [1, 2], [3, 0]].forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(bot[a].sx, bot[a].sy); ctx.lineTo(bot[b].sx, bot[b].sy);
          ctx.lineTo(top[b].sx, top[b].sy); ctx.lineTo(top[a].sx, top[a].sy);
          ctx.closePath();
          ctx.fillStyle = `rgba(30,60,100,0.6)`; ctx.fill();
          ctx.strokeStyle = theme.border; ctx.stroke();
        });

        // Ceiling
        ctx.beginPath(); ctx.moveTo(top[0].sx, top[0].sy);
        top.forEach(p => ctx.lineTo(p.sx, p.sy)); ctx.closePath();
        ctx.fillStyle = "rgba(20,50,90,0.4)"; ctx.fill();
        ctx.strokeStyle = theme.accent; ctx.lineWidth = 1; ctx.stroke();
      });

      rot += 0.008;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [unit]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ unit, onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", pan: "" });
  const [payMethod, setPayMethod] = useState("upi");
  const info = UNIT_TYPES[unit.type];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, fontFamily: "sans-serif"
    }}>
      <div style={{
        background: theme.surface, borderRadius: 16, width: "min(520px, 95vw)",
        border: `1px solid ${theme.border}`, overflow: "hidden"
      }}>
        {/* Steps */}
        <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}` }}>
          {["Details", "Review", "Payment", "Confirm"].map((s, i) => (
            <div key={s} style={{
              flex: 1, padding: "14px 0", textAlign: "center", fontSize: 11,
              color: step >= i + 1 ? theme.accent : theme.muted,
              background: step === i + 1 ? "rgba(200,169,110,0.08)" : "transparent",
              borderBottom: step === i + 1 ? `2px solid ${theme.accent}` : "2px solid transparent",
              letterSpacing: 1, fontWeight: step >= i + 1 ? 700 : 400,
            }}>{i + 1}. {s}</div>
          ))}
        </div>

        <div style={{ padding: 28 }}>
          {step === 1 && (
            <div>
              <div style={{ fontSize: 18, color: theme.text, fontWeight: 700, marginBottom: 20 }}>Your Details</div>
              {[
                { label: "Full Name", key: "name", placeholder: "As per Aadhar" },
                { label: "Email", key: "email", placeholder: "you@example.com" },
                { label: "Phone", key: "phone", placeholder: "+91 XXXXXXXXXX" },
                { label: "PAN Number", key: "pan", placeholder: "ABCDE1234F" },
              ].map(({ label, key, placeholder }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: theme.muted, letterSpacing: 1.5, marginBottom: 6 }}>{label.toUpperCase()}</div>
                  <input
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: "100%", padding: "10px 14px", background: theme.card, border: `1px solid ${theme.border}`,
                      borderRadius: 8, color: theme.text, fontSize: 13, boxSizing: "border-box",
                      outline: "none", fontFamily: "sans-serif"
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: 18, color: theme.text, fontWeight: 700, marginBottom: 20 }}>Booking Review</div>
              <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    ["Unit", `#${unit.unit}`],
                    ["Type", info.label],
                    ["Floor", `${unit.floor}th Floor`],
                    ["Area", `${info.sqft} sq.ft`],
                    ["Facing", unit.facing],
                    ["Price", `₹${(unit.price / 100000).toFixed(0)} Lakhs`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 9, color: theme.muted, letterSpacing: 1.5 }}>{k}</div>
                      <div style={{ fontSize: 14, color: theme.text, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: 9, color: theme.muted, letterSpacing: 1.5 }}>BOOKING AMOUNT (2%)</div>
                  <div style={{ fontSize: 22, color: theme.gold, fontWeight: 800 }}>
                    ₹{(unit.price * 0.02 / 100000).toFixed(2)} Lakhs
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ fontSize: 18, color: theme.text, fontWeight: 700, marginBottom: 20 }}>Payment</div>
              <div style={{ marginBottom: 16 }}>
                {["upi", "netbanking", "card"].map(m => (
                  <div
                    key={m}
                    onClick={() => setPayMethod(m)}
                    style={{
                      padding: "14px 16px", background: payMethod === m ? "rgba(200,169,110,0.1)" : theme.card,
                      border: `1px solid ${payMethod === m ? theme.accent : theme.border}`,
                      borderRadius: 8, marginBottom: 8, cursor: "pointer", display: "flex",
                      alignItems: "center", gap: 12,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: `2px solid ${payMethod === m ? theme.accent : theme.muted}`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {payMethod === m && <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.accent }} />}
                    </div>
                    <div>
                      <div style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>
                        {{ upi: "UPI Payment", netbanking: "Net Banking", card: "Credit / Debit Card" }[m]}
                      </div>
                      <div style={{ color: theme.muted, fontSize: 11 }}>
                        {{ upi: "PhonePe, GPay, Paytm", netbanking: "All major banks", card: "Visa, Mastercard, Amex" }[m]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 14, background: "rgba(46,204,113,0.08)", border: "1px solid rgba(46,204,113,0.2)", borderRadius: 8, fontSize: 12, color: theme.success }}>
                🔒 Secured by 256-bit SSL encryption. Payments processed via Razorpay.
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 22, color: theme.text, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</div>
              <div style={{ fontSize: 13, color: theme.muted, marginBottom: 24 }}>
                Reference: BK-{Date.now().toString(36).toUpperCase()}<br />
                Unit #{unit.unit} has been reserved for you.<br />
                Confirmation sent to {form.email || "your email"}.
              </div>
              <button onClick={onClose} style={{
                padding: "12px 32px", background: theme.accent, border: "none",
                borderRadius: 8, color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>DONE</button>
            </div>
          )}

          {step < 4 && (
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  flex: 1, padding: "12px 0", background: "none", border: `1px solid ${theme.border}`,
                  borderRadius: 8, color: theme.muted, cursor: "pointer", fontSize: 13
                }}>← BACK</button>
              )}
              <button
                onClick={() => step === 3 ? (setStep(4), onConfirm?.()) : setStep(s => s + 1)}
                style={{
                  flex: 2, padding: "12px 0", background: `linear-gradient(135deg, ${theme.accent}, ${theme.gold})`,
                  border: "none", borderRadius: 8, color: "#0D0A05", fontSize: 14, fontWeight: 700, cursor: "pointer"
                }}
              >
                {step === 3 ? "PAY NOW →" : "CONTINUE →"}
              </button>
            </div>
          )}
        </div>

        {step < 4 && (
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16, background: "none",
            border: "none", color: theme.muted, fontSize: 20, cursor: "pointer"
          }}>✕</button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);             // 1=building, 2=floor, 3=unit, 4=details
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [booking, setBooking] = useState(null);

  const handleFloorClick = (floorId) => {
    setSelectedFloor(floorId);
    setUnits(generateUnits(floorId));
    setSelectedUnit(null);
    setStep(2);
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setStep(3);
  };

  const floorInfo = FLOORS.find(f => f.id === selectedFloor);

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.text,
      fontFamily: "'Helvetica Neue', sans-serif", overflow: "hidden"
    }}>
      {/* ── HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 60, zIndex: 50,
        background: "rgba(7,11,16,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center",
        padding: "0 24px", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${theme.accent}, ${theme.gold})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>P</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: theme.text }}>PRESTIGE TOWERS</div>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: 2 }}>LUXURY RESIDENCES · PHASE 2</div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          {["Building", "Floor", "Unit", "Book"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  color: step > i + 1 ? theme.accent : step === i + 1 ? theme.text : theme.muted,
                  fontWeight: step === i + 1 ? 700 : 400, letterSpacing: 1, cursor: step > i + 1 ? "pointer" : "default"
                }}
                onClick={() => { if (step > i + 1) { setStep(i + 1); if (i < 1) setSelectedFloor(null); if (i < 2) setSelectedUnit(null); } }}
              >{i + 1}. {s.toUpperCase()}</span>
              {i < 3 && <span style={{ color: theme.border }}>›</span>}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: theme.muted }}>
          <span style={{ color: theme.success }}>●</span> LIVE AVAILABILITY
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ paddingTop: 60, height: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ─ STEP 1 & 2: Building + Floor Plan ─ */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* 3D Building */}
          <div style={{
            flex: step === 2 ? "0 0 55%" : "1", height: "calc(100vh - 60px)",
            position: "relative", transition: "flex 0.5s ease"
          }}>
            <Building3D
              selectedFloor={selectedFloor}
              hoveredFloor={hoveredFloor}
              onFloorClick={handleFloorClick}
              onFloorHover={setHoveredFloor}
            />

            {/* Overlay instructions */}
            {step === 1 && (
              <div style={{
                position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
                background: "rgba(7,11,16,0.85)", backdropFilter: "blur(8px)",
                border: `1px solid ${theme.border}`, borderRadius: 12, padding: "12px 24px",
                display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap"
              }}>
                <span style={{ fontSize: 18 }}>🖱️</span>
                <div>
                  <div style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>Click a floor to explore</div>
                  <div style={{ fontSize: 10, color: theme.muted }}>Drag to rotate · Auto-rotating</div>
                </div>
              </div>
            )}

            {/* Hovered floor tooltip */}
            {hoveredFloor && (
              <div style={{
                position: "absolute", top: 80, left: 24,
                background: "rgba(7,11,16,0.9)", border: `1px solid ${theme.accent}`,
                borderRadius: 8, padding: "10px 16px"
              }}>
                <div style={{ fontSize: 12, color: theme.accent, fontWeight: 700 }}>{FLOORS[hoveredFloor - 1]?.label}</div>
                <div style={{ fontSize: 10, color: theme.muted }}>
                  {FLOORS[hoveredFloor - 1]?.available} units available
                </div>
              </div>
            )}
          </div>

          {/* Floor plan panel */}
          {step >= 2 && (
            <div style={{
              flex: "0 0 45%", height: "calc(100vh - 60px)", overflowY: "auto",
              borderLeft: `1px solid ${theme.border}`, background: theme.surface,
              animation: "fadeIn 0.4s ease"
            }}>
              <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }`}</style>

              <div style={{ padding: "24px 24px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, color: theme.muted, letterSpacing: 2 }}>FLOOR PLAN</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, fontFamily: "Georgia, serif" }}>
                      {floorInfo?.label}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, color: theme.success, fontWeight: 700 }}>{floorInfo?.available}</div>
                    <div style={{ fontSize: 10, color: theme.muted }}>AVAILABLE</div>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  {[
                    { color: theme.success, label: "Available" },
                    { color: theme.warning, label: "Reserved" },
                    { color: theme.danger, label: "Booked" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: theme.muted }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, opacity: 0.7 }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* SVG Floorplan */}
              <div style={{ padding: "0 12px" }}>
                <SVGFloorplan units={units} onUnitClick={handleUnitClick} selectedUnit={selectedUnit} />
              </div>

              {/* Floor selector */}
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 10, color: theme.muted, letterSpacing: 2, marginBottom: 12 }}>SWITCH FLOOR</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {FLOORS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleFloorClick(f.id)}
                      style={{
                        flex: 1, padding: "8px 0", background: selectedFloor === f.id ? theme.accent : theme.card,
                        border: `1px solid ${selectedFloor === f.id ? theme.accent : theme.border}`,
                        borderRadius: 6, color: selectedFloor === f.id ? "#000" : theme.text,
                        fontSize: 11, fontWeight: 600, cursor: "pointer"
                      }}
                    >F{f.id}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Unit Detail Side Panel */}
      {selectedUnit && step === 3 && (
        <UnitPanel
          unit={selectedUnit}
          onClose={() => { setSelectedUnit(null); setStep(2); }}
          onBook={(u) => setBooking(u)}
        />
      )}

      {/* Booking Modal */}
      {booking && (
        <BookingModal
          unit={booking}
          onClose={() => { setBooking(null); setStep(2); setSelectedUnit(null); }}
          onConfirm={() => {}}
        />
      )}
    </div>
  );
}
