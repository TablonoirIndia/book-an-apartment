import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows, Html, useProgress } from '@react-three/drei'

// ── Loader Progress ──────────────────────────────────────────────────────────
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{ color: '#fff', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
        <div>Loading Building... {Math.round(progress)}%</div>
        <div style={{
          width: 200, height: 4, background: '#333',
          borderRadius: 4, marginTop: 8, overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: '#C8A96E', transition: 'width 0.3s'
          }} />
        </div>
      </div>
    </Html>
  )
}

// ── GLB Model ────────────────────────────────────────────────────────────────
function BuildingModel({ url, onFloorClick }) {
  const { scene } = useGLTF(url)

  const handleClick = (e) => {
    e.stopPropagation()

    const meshName = e.object.name  // e.g. "Floor_1", "Floor_2"
    console.log('Clicked mesh:', meshName)

    // Your Blender mesh names must follow "Floor_1", "Floor_2" pattern
    const match = meshName.match(/Floor_(\d+)/i)
    if (match && onFloorClick) {
      onFloorClick(parseInt(match[1]))
    }
  }

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, 0, 0]}
      onClick={handleClick}
    />
  )
}

// ── Main Viewer ──────────────────────────────────────────────────────────────
export default function BuildingViewer({ modelUrl, onFloorClick }) {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#070B10' }}>
      <Canvas
        shadows
        camera={{ position: [0, 30, 100], fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>

          {/* ── Lighting — critical for colors to show correctly ── */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[50, 100, 50]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-50, 50, -50]} intensity={0.4} color="#a0c4ff" />
          <pointLight position={[0, 50, 0]} intensity={0.8} color="#fff5e0" />

          {/* ── Your GLB Model ── */}
          <BuildingModel url={modelUrl} onFloorClick={onFloorClick} />

          {/* ── Environment (reflections on glass/metal) ── */}
          <Environment preset="city" />

          {/* ── Ground Shadow ── */}
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.5}
            scale={200}
            blur={1.5}
            far={50}
          />

          {/* ── 360° Orbit Control ── */}
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.8}
            enableZoom={true}
            enablePan={false}
            minDistance={30}
            maxDistance={300}
            maxPolarAngle={Math.PI / 2.1}  // prevents going underground
          />

        </Suspense>
      </Canvas>
    </div>
  )
}