import { useState } from 'react'
import BuildingViewer from './BuildingViewer'
import buildingGlb from '../../asserts/img/interior-design-3bhk.glb'
//                          ↑ fix typo: "asserts" → "assets"

export default function BuildingPage() {
  const [selectedFloor, setSelectedFloor] = useState(null)

  return (
    <>
      <BuildingViewer
        modelUrl={buildingGlb}
        onFloorClick={(floorNumber) => {
          setSelectedFloor(floorNumber)
        }}
      />

      {selectedFloor && (
        <div style={{ 
          position: 'fixed', bottom: 20, left: '50%', 
          transform: 'translateX(-50%)',
          background: '#111', color: '#fff', 
          padding: '12px 24px', borderRadius: 8 
        }}>
          Floor {selectedFloor} selected
        </div>
      )}
    </>
  )
}