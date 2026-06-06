import { useMemo, useRef, Suspense, useLayoutEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import * as THREE from 'three'

const LOGO_PATH = '/assets/Logo.svg'
const LOGO_SCALE = 0.011 * 6 * 6 * 6
const TILT_X = 0
const FIT_MARGIN = 1.02
const LOOK_AT_Y_FACTOR = 0.2 // shift logo down in frame, trim space below

const EXTRUDE = {
  depth: 6,
  bevelEnabled: true,
  bevelThickness: 1.1,
  bevelSize: 0.55,
  bevelSegments: 3,
  curveSegments: 12,
}

const CLASS_COLORS = {
  st0: '#ffffff',
  st1: '#2273b7',
  st2: '#6c9f42',
  st3: '#1e74b8',
  st4: '#1c74b9',
  st5: '#2074b8',
}

function pathColor(path) {
  const cls = path.userData?.node?.getAttribute('class') || ''
  for (const [key, hex] of Object.entries(CLASS_COLORS)) {
    if (cls.includes(key)) return hex
  }
  if (path.color) return `#${path.color.getHexString()}`
  return '#ffffff'
}

function CameraFit({ radius, scale, tilt }) {
  const { camera, size } = useThree()

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return

    const vFov = (camera.fov * Math.PI) / 180
    const aspect = size.width / Math.max(size.height, 1)
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    const tiltFactor = 1 / Math.cos(tilt)
    const r = radius * scale * tiltFactor * FIT_MARGIN

    const dist = Math.max(
      r / Math.tan(vFov / 2),
      r / Math.tan(hFov / 2),
    )

    camera.position.set(0, 0, dist)
    camera.near = Math.max(dist / 200, 0.1)
    camera.far = dist * 200
    camera.lookAt(0, radius * scale * LOOK_AT_Y_FACTOR, 0)
    camera.updateProjectionMatrix()
  }, [camera, size, radius, scale, tilt])

  return null
}

function ExtrudedLogo() {
  const spinRef = useRef()
  const svg = useLoader(SVGLoader, LOGO_PATH)

  const { meshes, radius } = useMemo(() => {
    const items = []
    const box = new THREE.Box3()

    svg.paths.forEach((path) => {
      const color = pathColor(path)
      SVGLoader.createShapes(path).forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, EXTRUDE)
        geometry.computeBoundingBox()
        if (geometry.boundingBox) box.union(geometry.boundingBox)
        items.push({ geometry, color })
      })
    })

    const center = new THREE.Vector3()
    box.getCenter(center)

    items.forEach(({ geometry }) => {
      geometry.translate(-center.x, -center.y, -center.z)
    })

    const centeredBox = new THREE.Box3()
    items.forEach(({ geometry }) => {
      geometry.computeBoundingBox()
      if (geometry.boundingBox) centeredBox.union(geometry.boundingBox)
    })

    const sphere = new THREE.Sphere()
    centeredBox.getBoundingSphere(sphere)

    return { meshes: items, radius: sphere.radius }
  }, [svg])

  useFrame((_, delta) => {
    if (!spinRef.current) return
    spinRef.current.rotation.x = 0
    spinRef.current.rotation.z = 0
    spinRef.current.rotation.y += delta * 1.1
  })

  return (
    <>
      <CameraFit radius={radius} scale={LOGO_SCALE} tilt={TILT_X} />
      <group ref={spinRef}>
        <group scale={[LOGO_SCALE, -LOGO_SCALE, LOGO_SCALE]}>
          {meshes.map((mesh, i) => (
            <mesh key={i} geometry={mesh.geometry}>
              <meshStandardMaterial
                color={mesh.color}
                metalness={0.45}
                roughness={0.35}
                emissive={mesh.color}
                emissiveIntensity={mesh.color === '#ffffff' ? 0.08 : 0.12}
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  )
}

export default function SpinningLogoCanvas({
  maxWidth = 'min(92vw, 900px)',
  height = 'min(20vw, 200px)',
  marginBottom = 'min(2vw, 20px)',
}) {
  return (
    <div
      className="mx-auto block"
      style={{
        width: maxWidth,
        height,
        margin: 0,
        marginBottom,
        padding: 0,
        overflow: 'hidden',
        lineHeight: 0,
      }}
      aria-hidden
    >
      <Canvas
        camera={{ fov: 42, position: [0, 0, 100] }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ display: 'block', margin: 0, padding: 0, background: 'transparent' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[8, 10, 14]} intensity={1.35} />
        <directionalLight position={[-6, -4, 8]} intensity={0.45} color="#29b6ff" />
        <pointLight position={[0, 0, 60]} intensity={0.35} color="#b3ff71" />
        <Suspense fallback={null}>
          <ExtrudedLogo />
        </Suspense>
      </Canvas>
    </div>
  )
}
