import { EarthGlobeCanvas } from './globe/EarthGlobeCanvas'

export default function HeroEarthCanvas() {
  return (
    <EarthGlobeCanvas
      className="h-full w-full"
      autoRotate
      enableRotate={false}
      enableZoom={false}
      starCount={1400}
      cameraDistance={4.5}
      qualityTier="auto"
    />
  )
}
