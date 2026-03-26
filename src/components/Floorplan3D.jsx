// import { useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import * as THREE from "three";
// import img from "../asserts/img/floor-plan-coloring.svg";

// function ApartmentMesh({ points }) {
//   const shape = new THREE.Shape();

//   points.forEach((p, i) => {
//     if (i === 0) shape.moveTo(p[0], p[1]);
//     else shape.lineTo(p[0], p[1]);
//   });

//   const geometry = new THREE.ExtrudeGeometry(shape, {
//     depth: 3,
//     bevelEnabled: false
//   });

//   return (
//     <mesh geometry={geometry}>
//       <meshStandardMaterial color="orange" />
//     </mesh>
//   );
// }

// export default function Floorplan3D() {
//   const [selected, setSelected] = useState(null);

//   const apartments = [
//     {
//       id: "A101",
//       coords: "60,60 200,60 200,160 60,160",
//       polygon: [
//         [0,0],
//         [6,0],
//         [6,4],
//         [0,4]
//       ]
//     },
//     {
//       id: "A102",
//       coords: "220,60 360,60 360,160 220,160",
//       polygon: [
//         [0,0],
//         [5,0],
//         [5,4],
//         [0,4]
//       ]
//     }
//   ];

//   return (
//     <div style={{ padding: 40 }}>

//       <h2>Apartment Floorplan</h2>

//       <div style={{ position: "relative", width: 500 }}>

//         <img
//           src={img}
//           width="500"
//           alt="floorplan"
//         />

//         <svg
//           width="500"
//           height="300"
//           style={{ position: "absolute", top: 0, left: 0 }}
//         >
//           {apartments.map((a) => (
//             <polygon
//               key={a.id}
//               points={a.coords}
//               fill="rgba(0,150,255,0.3)"
//               stroke="blue"
//               onClick={() => setSelected(a)}
//               style={{ cursor: "pointer" }}
//             />
//           ))}
//         </svg>
//       </div>

//       {selected && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "#000000cc"
//           }}
//         >
//           <button
//             onClick={() => setSelected(null)}
//             style={{ position: "absolute", zIndex: 2 }}
//           >
//             Close
//           </button>

//           <Canvas camera={{ position: [10, 10, 10] }}>
//             <ambientLight />
//             <directionalLight position={[10, 10, 5]} />

//             <ApartmentMesh points={selected.polygon} />

//             <OrbitControls />
//           </Canvas>
//         </div>
//       )}

//     </div>
//   );
// }

// import { useState, useMemo } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Center } from "@react-three/drei";
// import * as THREE from "three";
// import img from "../asserts/img/floor-plan-coloring.svg";

// /* -----------------------------
//    🔹 Replace this with DB data
// --------------------------------*/
// const apartmentsData = [
//   {
//     id: "unit_1",
//     coordinates: [
//       { x: 70.35, y: 380.93 },
//       { x: 174.14, y: -120.71 },
//       { x: 66.11, y: 74.12 },
//       { x: -2.57, y: -9.78 },
//       { x: -12.22, y: 0.22 },
//       { x: -17.22, y: -0.61 },
//       { x: -13.06, y: -3.72 },
//       { x: -21.06, y: -11.33 },
//       { x: -7.5, y: -7.67 },
//       { x: -21.67, y: -22.78 },
//       { x: -31.06, y: -27.28 },
//       { x: -18.94, y: -9.67 },
//       { x: -42.61, y: -9.67 },
//       { x: -23.72, y: -0.72 },
//       { x: -76.61, y: -2.28 },
//       { x: -76.61, y: -2.28 },
//       { x: 0.0, y: 0.0 },
//       { x: -16.5, y: -2.28 },
//       { x: -37.44, y: 9.0 },
//       { x: -6.89, y: 4.11 },
//       { x: -20.37, y: 10.81 },
//       { x: -31.11, y: 32.44 },
//       { x: -1.63, y: 3.56 },
//       { x: -7.41, y: 13.93 },
//       { x: -7.63, y: 32.52 },
//       { x: -0.96, y: 18.74 },
//       { x: -6.81, y: 172.74 },
//       { x: -6.81, y: 172.74 },
//       { x: 0.0, y: 0.0 },
//       { x: 0.07, y: 15.54 },
//       { x: 5.41, y: 26.93 },
//       { x: 9.56, y: 18.06 },
//       { x: 16.83, y: 25.11 },
//       { x: 6.94, y: 7.67 },
//       { x: 10.33, y: 13.56 },
//       { x: 11.28, y: 24.83 },
//       { x: 0.06, y: 11.06 },
//       { x: 0.36, y: 44.18 },
//       { x: 0.36, y: 44.18 },
//     ],
//   },
//   {
//     id: "unit_2",
//     coordinates: [
//       { x: 312.32, y: 260.32 },
//       { x: 296.19, y: 64.23 },
//       { x: -11.21, y: -13.86 },
//       { x: -0.77, y: -22.34 },
//       { x: -8.47, y: -6.81 },
//       { x: -6.56, y: -13.63 },
//       { x: -13.3, y: -13.63 },
//       { x: -13.3, y: 0.0 },
//       { x: 0.0, y: -12.15 },
//       { x: -11.19, y: -22.26 },
//       { x: -14.96, y: 18.0 },
//       { x: -6.11, y: -27.22 },
//       { x: -6.11, y: -40.74 },
//       { x: -0.52, y: -40.74 },
//       { x: -0.52, y: -45.3 },
//       { x: -0.7, y: -11.7 },
//       { x: -0.07, y: -16.04 },
//       { x: 0.93, y: -26.48 },
//       { x: 6.52, y: -9.48 },
//       { x: 4.96, y: -14.81 },
//       { x: 7.5, y: -22.19 },
//       { x: 15.5, y: -7.74 },
//       { x: 7.7, y: -13.33 },
//       { x: 13.56, y: 18.0 },
//       { x: 16.3, y: -4.85 },
//       { x: 2.96, y: -13.96 },
//       { x: 6.52, y: -20.44 },
//       { x: 5.78, y: -13.44 },
//       { x: 0.37, y: -19.19 },
//       { x: 0.04, y: -19.19 },
//       { x: 0.04, y: 4.51 },
//     ],
//   },
// ];

// /* -----------------------------
//    🔹 Convert SVG coords to string
// --------------------------------*/
// // function toSvgPoints(coords) {
// //   return coords.map((p) => `${p.x},${p.y}`).join(" ");
// // }

// function convertToAbsolute(coords) {
//   let absolutePoints = [];
//   let currentX = 0;
//   let currentY = 0;

//   coords.forEach((p, index) => {
//     if (index === 0) {
//       // first point is absolute start
//       currentX = p.x;
//       currentY = p.y;
//     } else {
//       currentX += p.x;
//       currentY += p.y;
//     }

//     absolutePoints.push({ x: currentX, y: currentY });
//   });

//   return absolutePoints;
// }

// function toSvgPoints(coords) {
//   const absolute = convertToAbsolute(coords);
//   return absolute.map((p) => `${p.x},${p.y}`).join(" ");
// }

// /* -----------------------------
//    🔹 Convert SVG coords to Three.js
//    - Scale down
//    - Invert Y axis
// --------------------------------*/
// // function toThreePoints(coords) {
// //   const scale = 0.02;

// //   return coords.map((p) => [p.x * scale, -p.y * scale]);
// // }

// function toThreePoints(coords) {
//   const absolute = convertToAbsolute(coords);
//   const scale = 0.02;

//   return absolute.map((p) => [p.x * scale, -p.y * scale]);
// }

// /* -----------------------------
//    🔹 3D Apartment Mesh
// --------------------------------*/
// function ApartmentMesh({ points }) {
//   const geometry = useMemo(() => {
//     const shape = new THREE.Shape();

//     points.forEach((p, i) => {
//       if (i === 0) shape.moveTo(p[0], p[1]);
//       else shape.lineTo(p[0], p[1]);
//     });

//     shape.closePath();

//     return new THREE.ExtrudeGeometry(shape, {
//       depth: 2,
//       bevelEnabled: false,
//     });
//   }, [points]);

//   return (
//     <mesh geometry={geometry}>
//       <meshStandardMaterial color="orange" />
//     </mesh>
//   );
// }

// /* =============================
//    🔹 MAIN COMPONENT
// =============================*/
// export default function Floorplan3D() {
//   const [selected, setSelected] = useState(null);

//   return (
//     <div style={{ padding: 40 }}>
//       <h2>Apartment Floorplan</h2>

//       {/* =============================
//           SVG OVERLAY SECTION
//       ============================== */}
//       <div style={{ position: "relative", width: 800 }}>
//         <img src={img} width="800" alt="floorplan" />

//         <svg
//           viewBox="0 0 1600 1000"
//           width="800"
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//           }}
//         >
//           {apartmentsData.map((a) => (
//             <polygon
//               key={a.id}
//               points={toSvgPoints(a.coordinates)}
//               fill="rgba(0,150,255,0.3)"
//               stroke="blue"
//               strokeWidth="2"
//               onClick={() =>
//                 setSelected({
//                   ...a,
//                   polygon: toThreePoints(a.coordinates),
//                 })
//               }
//               style={{ cursor: "pointer" }}
//             />
//           ))}
//         </svg>
//       </div>

//       {/* =============================
//           3D MODAL VIEW
//       ============================== */}
//       {selected && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "#000000cc",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <button
//             onClick={() => setSelected(null)}
//             style={{
//               position: "absolute",
//               top: 20,
//               right: 20,
//               zIndex: 2,
//               padding: "8px 12px",
//             }}
//           >
//             Close
//           </button>

//           <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[10, 10, 5]} intensity={1} />

//             <Center>
//               <ApartmentMesh points={selected.polygon} />
//             </Center>

//             <OrbitControls />
//           </Canvas>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useMemo, useEffect } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Center } from "@react-three/drei";
// import * as THREE from "three";
// import img from "../asserts/img/floor-plan-coloring.svg";

// // 🔹 Import apartments JSON generated from Python
// import apartmentsJSON from "../asserts/img/apartments.json";

// /* -----------------------------
//    🔹 Convert SVG coords to string
// --------------------------------*/
// function toSvgPoints(coords) {
//   return coords.map((p) => `${p.x},${p.y}`).join(" ");
// }

// /* -----------------------------
//    🔹 Convert SVG coords to Three.js
//    - Scale down
//    - Invert Y axis
// --------------------------------*/
// function toThreePoints(coords) {
//   const scale = 0.02; // adjust scale to fit Three.js scene
//   return coords.map((p) => [p.x * scale, -p.y * scale]);
// }

// /* -----------------------------
//    🔹 3D Apartment Mesh
// --------------------------------*/
// function ApartmentMesh({ points }) {
//   const geometry = useMemo(() => {
//     const shape = new THREE.Shape();

//     points.forEach((p, i) => {
//       if (i === 0) shape.moveTo(p[0], p[1]);
//       else shape.lineTo(p[0], p[1]);
//     });

//     shape.closePath();

//     return new THREE.ExtrudeGeometry(shape, {
//       depth: 2, // height of 3D walls
//       bevelEnabled: false,
//     });
//   }, [points]);

//   return (
//     <mesh geometry={geometry}>
//       <meshStandardMaterial color="orange" />
//     </mesh>
//   );
// }

// /* =============================
//    🔹 MAIN COMPONENT
// =============================*/
// export default function Floorplan3D() {
//   const [selected, setSelected] = useState(null);
//   const [apartments, setApartments] = useState([]);

//   // Load apartments JSON on mount
//   useEffect(() => {
//     setApartments(apartmentsJSON);
//   }, []);

//   return (
//     <div style={{ padding: 40 }}>
//       <h2>Apartment Floorplan</h2>

//       {/* =============================
//           SVG OVERLAY SECTION
//       ============================== */}
//       <div style={{ position: "relative", width: 800 }}>
//         <img src={img} width="950" alt="floorplan" />

//         <svg
//           viewBox="0 0 1600 1200"
//           width="1000"
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//           }}
//         >
//           {apartments.map((a) => (
//             <polygon
//               key={a.unit}
//               points={toSvgPoints(a.coordinates)}
//               fill="rgba(0,150,255,0.3)"
//               stroke="blue"
//               strokeWidth="2"
//               onClick={() =>
//                 setSelected({
//                   ...a,
//                   polygon: toThreePoints(a.coordinates),
//                 })
//               }
//               style={{ cursor: "pointer" }}
//             />
//           ))}
//         </svg>
//       </div>

//       {/* =============================
//           3D MODAL VIEW
//       ============================== */}
//       {selected && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "#000000cc",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <button
//             onClick={() => setSelected(null)}
//             style={{
//               position: "absolute",
//               top: 20,
//               right: 20,
//               zIndex: 2,
//               padding: "8px 12px",
//             }}
//           >
//             Close
//           </button>

//           <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[10, 10, 5]} intensity={1} />

//             <Center>
//               <ApartmentMesh points={selected.polygon} />
//             </Center>

//             <OrbitControls />
//           </Canvas>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import img from "../asserts/img/floor-plan-coloring.svg";
import apartmentsJSON from "../asserts/img/apartments.json";

/* ─────────────────────────────────────────────
   CONSTANTS
   Adjust SVG_W / SVG_H to match your actual SVG
   viewBox / coordinate space from the Python output
───────────────────────────────────────────────*/
const SVG_W = 1600;  // match your floor plan's coordinate width
const SVG_H = 1200;  // match your floor plan's coordinate height
const DISPLAY_W = 950; // px width of the rendered <img>
const DISPLAY_H = (SVG_H / SVG_W) * DISPLAY_W; // auto-calculated height

const UNIT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

/* ─────────────────────────────────────────────
   Convert flat {x,y}[] → SVG points string
   (coords are already in SVG coordinate space)
───────────────────────────────────────────────*/
function toSvgPoints(coords) {
  return coords.map((p) => `${p.x},${p.y}`).join(" ");
}

/* ─────────────────────────────────────────────
   Convert {x,y}[] → Three.js [x, y][]
   - Center the shape around origin
   - Scale to a reasonable 3D size
   - Flip Y axis (SVG Y goes down, Three.js Y goes up)
───────────────────────────────────────────────*/
function toThreePoints(coords) {
  if (!coords.length) return [];

  // Find bounding box to center the shape
  const xs = coords.map((p) => p.x);
  const ys = coords.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

  const scale = 0.015; // tune this so the shape fits the 3D viewport
  return coords.map((p) => [(p.x - cx) * scale, -(p.y - cy) * scale]);
}

/* ─────────────────────────────────────────────
   3D Apartment Mesh
───────────────────────────────────────────────*/
function ApartmentMesh({ points, color }) {
  const geometry = useMemo(() => {
    if (points.length < 3) return null;

    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => {
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 1.5,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2,
    });
  }, [points]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Auto-fit camera to geometry
───────────────────────────────────────────────*/
function CameraFit({ points }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!points.length) return;
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    const dist = Math.max(w, h) * 2.5;
    camera.position.set(0, dist * 0.6, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [points, camera]);

  return null;
}

/* ─────────────────────────────────────────────
   Coordinate Table
───────────────────────────────────────────────*/
function CoordTable({ apartment }) {
  return (
    <div style={styles.tableWrapper}>
      <div style={styles.tableHeader}>
        <span style={styles.tableTitle}>{apartment.unit}</span>
        <span style={styles.tableSub}>{apartment.coordinates.length} points</span>
      </div>
      <div style={styles.tableScroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>X</th>
              <th style={styles.th}>Y</th>
            </tr>
          </thead>
          <tbody>
            {apartment.coordinates.map((c, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>{c.x.toFixed(2)}</td>
                <td style={styles.td}>{c.y.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────*/
export default function Floorplan3D() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [apartments] = useState(apartmentsJSON);

  const selectedThree = useMemo(
    () => (selected ? toThreePoints(selected.coordinates) : []),
    [selected]
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Floor Plan · Unit Explorer</h2>
      <p style={styles.sub}>Click any highlighted unit to view it in 3D</p>

      {/* ── SVG OVERLAY ON FLOOR PLAN ─────────────── */}
      <div style={{ position: "relative", width: DISPLAY_W, height: DISPLAY_H }}>
        {/* Base floor plan image */}
        <img
          src={img}
          width={DISPLAY_W}
          height={DISPLAY_H}
          alt="floorplan"
          style={{ display: "block" }}
        />

        {/* SVG overlay — viewBox matches coordinate space, size matches image */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={DISPLAY_W}
          height={DISPLAY_H}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {apartments.map((a, idx) => {
            const color = UNIT_COLORS[idx % UNIT_COLORS.length];
            const isHovered = hovered === a.unit;
            return (
              <g key={a.unit}>
                <polygon
                  points={toSvgPoints(a.coordinates)}
                  fill={`${color}55`}  // 33% opacity hex
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 1.5}
                  style={{ cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={() => setHovered(a.unit)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(a)}
                />
                {/* Unit label at centroid */}
                <text
                  x={a.coordinates.reduce((s, p) => s + p.x, 0) / a.coordinates.length}
                  y={a.coordinates.reduce((s, p) => s + p.y, 0) / a.coordinates.length}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fontSize={28}
                  fontWeight="bold"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {a.unit.replace("unit_", "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── COORDINATE TABLE STRIP ────────────────── */}
      {apartments.length > 0 && (
        <div style={styles.strip}>
          {apartments.map((a, idx) => (
            <div
              key={a.unit}
              style={{
                ...styles.card,
                borderColor: UNIT_COLORS[idx % UNIT_COLORS.length],
                background: selected?.unit === a.unit ? "#1e2a3a" : "#111827",
              }}
              onClick={() => setSelected(a)}
            >
              <div style={{ color: UNIT_COLORS[idx % UNIT_COLORS.length], fontWeight: 700 }}>
                {a.unit}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                {a.coordinates.length} pts
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3D MODAL ──────────────────────────────── */}
      {selected && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div style={styles.modalBox}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>{selected.unit} — 3D View</span>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Body: 3D + table */}
            <div style={styles.modalBody}>
              {/* Three.js Canvas */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Canvas
                  shadows
                  camera={{ position: [0, 5, 10], fov: 50 }}
                  style={{ height: 380, borderRadius: 8, background: "#0d1117" }}
                >
                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[10, 15, 10]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                  />
                  <pointLight position={[-10, -5, -5]} intensity={0.3} />

                  <CameraFit points={selectedThree} />

                  <ApartmentMesh
                    points={selectedThree}
                    color={UNIT_COLORS[
                      apartments.findIndex((a) => a.unit === selected.unit) % UNIT_COLORS.length
                    ]}
                  />

                  {/* Grid floor */}
                  <gridHelper args={[30, 30, "#1e293b", "#1e293b"]} position={[0, -0.1, 0]} />

                  <OrbitControls enablePan enableZoom enableRotate />
                </Canvas>
                <p style={{ color: "#475569", fontSize: 11, marginTop: 6, textAlign: "center" }}>
                  Drag to rotate · Scroll to zoom · Right-click to pan
                </p>
              </div>

              {/* Coordinate Table */}
              <CoordTable apartment={selected} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────*/
const styles = {
  page: {
    padding: 32,
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    background: "#0d1117",
    minHeight: "100vh",
    color: "#e2e8f0",
  },
  heading: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 4,
    color: "#e2e8f0",
  },
  sub: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
  },
  strip: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  card: {
    padding: "10px 16px",
    border: "1px solid",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    transition: "background 0.15s",
    userSelect: "none",
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalBox: {
    background: "#111827",
    borderRadius: 12,
    border: "1px solid #1e293b",
    width: "min(900px, 95vw)",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: "#e2e8f0",
  },
  closeBtn: {
    background: "#1e293b",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 14,
  },
  modalBody: {
    display: "flex",
    gap: 20,
    padding: 20,
    overflow: "hidden",
    flex: 1,
  },
  tableWrapper: {
    width: 220,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    border: "1px solid #1e293b",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    background: "#1e293b",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableTitle: {
    fontWeight: 700,
    fontSize: 12,
    color: "#e2e8f0",
  },
  tableSub: {
    fontSize: 10,
    color: "#64748b",
  },
  tableScroll: {
    overflowY: "auto",
    flex: 1,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 11,
  },
  th: {
    padding: "6px 10px",
    background: "#0d1117",
    color: "#64748b",
    textAlign: "left",
    fontWeight: 600,
    position: "sticky",
    top: 0,
  },
  td: {
    padding: "5px 10px",
    color: "#94a3b8",
  },
  trEven: { background: "#111827" },
  trOdd: { background: "#0d1117" },
};
