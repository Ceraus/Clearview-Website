import { useRef, useMemo, useEffect, useState, Component } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { getSunDirection, latLonToVector3 } from '../utils/solar'
import { fetchUserLocation } from '../utils/geolocation'

const EARTH_RADIUS = 2.4
const SPIN_SPEED = 0.018
const SUN_REFRESH_MS = 30000

// three.js planet textures, served from the GitHub source via CDN mirrors
// (the published npm package strips these images, so we point at the repo).
const PLANET = (file) => [
  `https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/${file}`,
  `https://raw.githack.com/mrdoob/three.js/dev/examples/textures/planets/${file}`,
]

const MATTEASON = (size) => `https://clouds.matteason.co.uk/images/${size}/clouds.jpg`

// Shared low-risk fallbacks (every tier ends here so the globe always renders,
// even fully offline or with every CDN blocked).
const DAY_BASE = [...PLANET('earth_atmos_2048.jpg'), '/assets/textures/earth_day_2048.jpg']
const NIGHT_BASE = [...PLANET('earth_lights_2048.png'), '/assets/textures/earth_night_2048.png']
const NORMAL_SRC = [...PLANET('earth_normal_2048.jpg'), '/assets/textures/earth_normal_2048.jpg']
const SPEC_SRC = [...PLANET('earth_specular_2048.jpg'), '/assets/textures/earth_specular_2048.jpg']
const CLOUD_BASE = [
  'https://www.solarsystemscope.com/textures/download/2k_earth_clouds.jpg',
  ...PLANET('earth_clouds_1024.png'),
  '/assets/textures/earth_clouds_2048.jpg',
  '/assets/textures/earth_clouds_1024.png',
]

// Quality tiers chosen from the user's hardware (see detectQualityTier). Each
// tier lists progressively-degrading sources, so a failed high-res fetch simply
// falls through to the guaranteed local copies.
const QUALITY = {
  high: {
    day: [...PLANET('earth_day_4096.jpg'), ...DAY_BASE],
    night: [...PLANET('earth_night_4096.jpg'), ...NIGHT_BASE],
    normal: NORMAL_SRC,
    specular: SPEC_SRC,
    clouds: [MATTEASON('8192x4096'), 'https://www.solarsystemscope.com/textures/download/4k_earth_clouds.jpg', MATTEASON('2048x1024'), ...CLOUD_BASE],
    segments: 160,
    dpr: 2,
    anisotropy: 16,
  },
  medium: {
    day: [...PLANET('earth_day_4096.jpg'), ...DAY_BASE],
    night: [...PLANET('earth_night_4096.jpg'), ...NIGHT_BASE],
    normal: NORMAL_SRC,
    specular: SPEC_SRC,
    clouds: ['https://www.solarsystemscope.com/textures/download/4k_earth_clouds.jpg', MATTEASON('2048x1024'), ...CLOUD_BASE],
    segments: 128,
    dpr: 1.75,
    anisotropy: 16,
  },
  low: {
    day: DAY_BASE,
    night: NIGHT_BASE,
    normal: NORMAL_SRC,
    specular: SPEC_SRC,
    clouds: [MATTEASON('1024x512'), ...PLANET('earth_clouds_1024.png'), '/assets/textures/earth_clouds_1024.png'],
    segments: 96,
    dpr: 1.25,
    anisotropy: 4,
  },
}

// Pick a quality tier from GPU/CPU/memory capability. Conservative by design:
// anything uncertain, software-rendered, or mobile falls to a lower tier so the
// hero always runs, while strong desktops unlock 8K.
function detectQualityTier() {
  if (typeof document === 'undefined') return 'low'
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'low'

    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048
    const cores = navigator.hardwareConcurrency || 2
    const mem = navigator.deviceMemory || 4
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')

    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : ''
    const software = /SwiftShader|Software|llvmpipe|Microsoft Basic|ANGLE \(Google/i.test(renderer)

    if (software || maxTex < 4096) return 'low'
    if (mobile) return maxTex >= 8192 && cores >= 6 ? 'medium' : 'low'
    if (maxTex >= 8192 && cores >= 8 && mem >= 8) return 'high'
    if (maxTex >= 4096 && cores >= 4) return 'medium'
    return 'low'
  } catch {
    return 'low'
  }
}

const CLOUD_SAMPLE_GLSL = `
uniform vec2 uCloudTexel;

float sampleCloudRaw(vec2 uv) {
  vec3 c = texture2D(uClouds, uv).rgb;
  return max(c.r, max(c.g, c.b));
}

float cloudDensitySoft(vec2 uv) {
  vec2 px = uCloudTexel;
  float d = sampleCloudRaw(uv) * 2.55;
  d += sampleCloudRaw(uv + vec2(px.x, 0.0)) * 0.78;
  d += sampleCloudRaw(uv - vec2(px.x, 0.0)) * 0.78;
  d += sampleCloudRaw(uv + vec2(0.0, px.y)) * 0.78;
  d += sampleCloudRaw(uv - vec2(0.0, px.y)) * 0.78;
  d /= 4.89;
  return pow(clamp(d, 0.0, 1.0), 0.76);
}
`

const ATMOS_VERT = `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const ATMOS_FRAG = `
  uniform vec3 glowColor;
  uniform vec3 uSunDir;
  uniform float intensity;
  uniform float power;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 N = normalize(vWorldNormal);
    float rim = pow(1.0 - abs(dot(N, V)), power);
    float sun = dot(N, normalize(uSunDir));
    float dayLit = smoothstep(-0.35, 0.5, sun);
    vec3 col = mix(glowColor, vec3(1.0, 0.5, 0.22), smoothstep(0.0, 0.3, 1.0 - abs(sun)) * 0.55 * dayLit);
    float a = rim * intensity * (0.22 + 0.95 * dayLit);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`

const EARTH_VERT = `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDirW;
  varying vec3 vTangentW;
  varying vec3 vBitangentW;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDirW = normalize(cameraPosition - worldPos.xyz);

    vec3 t = normalize(mat3(modelMatrix) * vec3(1.0, 0.0, 0.0));
    vec3 b = cross(vNormalW, t);
    vTangentW = t;
    vBitangentW = b;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const EARTH_FRAG = `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uNormal;
  uniform sampler2D uSpecular;
  uniform sampler2D uClouds;
  uniform vec3 uSunDir;
  uniform float uCloudShadow;
  uniform float uCloudPhase;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDirW;
  varying vec3 vTangentW;
  varying vec3 vBitangentW;

  ${CLOUD_SAMPLE_GLSL}

  void main() {
    vec3 normalSample = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
    mat3 tbn = mat3(normalize(vTangentW), normalize(vBitangentW), normalize(vNormalW));
    vec3 normal = normalize(tbn * normalSample);

    vec3 dayCol = texture2D(uDay, vUv).rgb;
    vec3 nightCol = texture2D(uNight, vUv).rgb;
    float specMask = texture2D(uSpecular, vUv).r;
    vec3 sunDir = normalize(uSunDir);
    vec2 cloudUv = vec2(fract(vUv.x + uCloudPhase), vUv.y);

    // Directional cast shadow: sample the cloud map offset along the sun's
    // surface-tangent direction so shadows land on the anti-sun side of clouds
    // (instead of straight underneath), which grounds them to the surface.
    vec2 sunT = vec2(dot(sunDir, normalize(vTangentW)), dot(sunDir, normalize(vBitangentW)));
    vec2 shadowUv = vec2(fract(cloudUv.x - sunT.x * 0.013), clamp(cloudUv.y - sunT.y * 0.013, 0.0, 1.0));
    float cloudShadow = cloudDensitySoft(shadowUv);

    float ndl = dot(normal, sunDir);
    float dayMix = smoothstep(-0.12, 0.32, ndl);
    vec3 color = mix(nightCol * 1.35, dayCol, dayMix);
    color *= 1.0 - cloudShadow * uCloudShadow * dayMix;

    float oceanSpec = specMask * pow(max(ndl, 0.0), 48.0) * 0.55;
    float fresnel = pow(1.0 - max(dot(normal, vViewDirW), 0.0), 3.0);
    color += vec3(0.45, 0.62, 0.82) * (oceanSpec + fresnel * specMask * 0.18);

    gl_FragColor = vec4(color, 1.0);
  }
`

const CLOUD_VERT = `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDirW;
  varying vec3 vTangentW;
  varying vec3 vBitangentW;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDirW = normalize(cameraPosition - worldPos.xyz);
    vec3 t = normalize(mat3(modelMatrix) * vec3(1.0, 0.0, 0.0));
    vTangentW = t;
    vBitangentW = cross(vNormalW, t);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const CLOUD_FRAG = `
  uniform sampler2D uClouds;
  uniform vec3 uSunDir;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDirW;
  varying vec3 vTangentW;
  varying vec3 vBitangentW;

  ${CLOUD_SAMPLE_GLSL}

  void main() {
    float density = cloudDensitySoft(vUv);
    float coverage = smoothstep(0.05, 0.33, density);
    if (coverage <= 0.001) discard;

    // Soft relief sampled from the real cloud-map gradient gives gentle,
    // shape-aligned self-shading (puffy tops, shaded flanks) without noise.
    vec2 px = uCloudTexel * 1.5;
    float hL = cloudDensitySoft(vUv - vec2(px.x, 0.0));
    float hR = cloudDensitySoft(vUv + vec2(px.x, 0.0));
    float hD = cloudDensitySoft(vUv - vec2(0.0, px.y));
    float hU = cloudDensitySoft(vUv + vec2(0.0, px.y));
    vec3 bumpTS = normalize(vec3((hL - hR) * 2.4, (hD - hU) * 2.4, 1.0));
    mat3 tbn = mat3(normalize(vTangentW), normalize(vBitangentW), normalize(vNormalW));
    vec3 geoN = normalize(vNormalW);
    vec3 N = normalize(mix(geoN, normalize(tbn * bumpTS), 0.55));

    vec3 sunDir = normalize(uSunDir);
    vec3 viewDir = normalize(vViewDirW);
    float ndlGeo = dot(geoN, sunDir);
    float dayMix = smoothstep(-0.22, 0.48, ndlGeo);

    // Tonal ramp from cool shadowed flanks to bright, slightly warm sunlit tops.
    float lit = clamp(dot(N, sunDir) * 0.5 + 0.5, 0.0, 1.0);
    vec3 dayCloud = mix(vec3(0.55, 0.60, 0.70), vec3(1.0, 0.99, 0.96), pow(lit, 0.6));
    vec3 nightCloud = vec3(0.07, 0.10, 0.16);
    vec3 cloudColor = mix(nightCloud, dayCloud, dayMix);

    // Silver lining along the day/night terminator.
    float terminator = pow(1.0 - abs(ndlGeo), 4.0);
    cloudColor += vec3(0.95, 0.97, 1.0) * terminator * coverage * 0.40;

    // Forward scatter where sunlight passes through cloud edges toward us.
    float forwardScatter = pow(max(dot(viewDir, sunDir), 0.0), 9.0);
    cloudColor += vec3(1.0, 0.97, 0.92) * forwardScatter * coverage * 0.22 * dayMix;

    // Thin wisps stay translucent, dense cores read solid.
    float alpha = coverage * mix(0.2, uOpacity, dayMix);
    gl_FragColor = vec4(cloudColor, clamp(alpha, 0.0, 0.86));
  }
`

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

function configureTexture(texture, { srgb = false, anisotropy = 8, repeat = false } = {}) {
  if (!texture) return
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
  }
  texture.needsUpdate = true
}

function loadFirstAvailable(urls, options) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    let index = 0
    const attempt = () => {
      if (index >= urls.length) {
        reject(new Error('all sources failed'))
        return
      }
      const url = urls[index++]
      loader.load(
        url,
        (texture) => {
          configureTexture(texture, options)
          resolve(texture)
        },
        undefined,
        attempt,
      )
    }
    attempt()
  })
}

function createEmptyCloudTexture() {
  const texture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat)
  texture.needsUpdate = true
  return texture
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function AtmosphereGlow({ radius, color, intensity, power, sunUniform }) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      uSunDir: sunUniform,
      intensity: { value: intensity },
      power: { value: power },
    }),
    [color, intensity, power, sunUniform],
  )

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={ATMOS_VERT}
        fragmentShader={ATMOS_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function LocationMarker({ location }) {
  const markerRef = useRef()
  const position = useMemo(() => {
    if (!location) return null
    return latLonToVector3(location.lat, location.lon, EARTH_RADIUS + 0.015)
  }, [location])

  useFrame(({ clock }) => {
    if (!markerRef.current) return
    const pulse = 0.85 + Math.sin(clock.getElapsedTime() * 2.2) * 0.25
    markerRef.current.scale.setScalar(pulse)
  })

  if (!position) return null

  return (
    <group position={position}>
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#5ad4ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

function CloudLayer({ cloudsRef, sunUniform, segments, quality }) {
  const { gl } = useThree()
  const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), quality.anisotropy)
  const [clouds, setClouds] = useState(null)

  const uniforms = useMemo(
    () => ({
      uClouds: { value: createEmptyCloudTexture() },
      uCloudTexel: { value: new THREE.Vector2(1 / 1024, 1 / 512) },
      uSunDir: sunUniform,
      uOpacity: { value: 0.78 },
    }),
    [sunUniform],
  )

  useEffect(() => {
    let cancelled = false
    loadFirstAvailable(quality.clouds, { srgb: true, anisotropy, repeat: true })
      .then((texture) => {
        if (cancelled) return
        const width = texture.image?.width || 1024
        const height = texture.image?.height || 512
        uniforms.uCloudTexel.value.set(1 / width, 1 / height)
        uniforms.uClouds.value = texture
        setClouds(texture)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [anisotropy, uniforms, quality])

  if (!clouds) return null

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[EARTH_RADIUS + 0.022, segments, segments]} />
      <shaderMaterial
        vertexShader={CLOUD_VERT}
        fragmentShader={CLOUD_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}

function TexturedEarth({ sunUniform, baseYaw, location, segments, quality, onError }) {
  const groupRef = useRef()
  const earthRef = useRef()
  const cloudsRef = useRef()
  const { gl } = useThree()
  const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), quality.anisotropy)
  const [textures, setTextures] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      loadFirstAvailable(quality.day, { srgb: true, anisotropy }),
      loadFirstAvailable(quality.night, { srgb: true, anisotropy }),
      loadFirstAvailable(quality.normal, { anisotropy }),
      loadFirstAvailable(quality.specular, { anisotropy }),
    ])
      .then(([day, night, normal, specular]) => {
        if (cancelled) return
        setTextures({ day, night, normal, specular })
      })
      .catch(() => {
        if (!cancelled) onError?.()
      })
    return () => {
      cancelled = true
    }
  }, [anisotropy, onError, quality])

  const earthUniforms = useMemo(() => {
    if (!textures) return null
    return {
      uDay: { value: textures.day },
      uNight: { value: textures.night },
      uNormal: { value: textures.normal },
      uSpecular: { value: textures.specular },
      uClouds: { value: createEmptyCloudTexture() },
      uCloudTexel: { value: new THREE.Vector2(1 / 1024, 1 / 512) },
      uSunDir: sunUniform,
      uCloudShadow: { value: 0.2 },
      uCloudPhase: { value: 0 },
    }
  }, [textures, sunUniform])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Idle motion + drag now come from OrbitControls (camera). Keep the globe
    // fixed at the location-facing yaw, and let clouds drift over the surface.
    if (groupRef.current) groupRef.current.rotation.y = baseYaw
    if (cloudsRef.current) cloudsRef.current.rotation.y = t * SPIN_SPEED * 0.22
    if (earthUniforms) earthUniforms.uCloudPhase.value = (t * SPIN_SPEED * 0.22) / (Math.PI * 2)
  })

  if (!earthUniforms) return null

  return (
    <group ref={groupRef}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, segments, segments]} />
        <shaderMaterial vertexShader={EARTH_VERT} fragmentShader={EARTH_FRAG} uniforms={earthUniforms} />
      </mesh>
      <CloudLayer cloudsRef={cloudsRef} sunUniform={sunUniform} segments={segments} quality={quality} />
      <LocationMarker location={location} />
    </group>
  )
}

function FallbackEarth({ sunUniform, baseYaw, segments }) {
  const groupRef = useRef()
  const lightRef = useRef()

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y = baseYaw
    if (lightRef.current) lightRef.current.position.copy(sunUniform.value).multiplyScalar(10)
  })

  return (
    <>
      <directionalLight ref={lightRef} intensity={2.4} color="#eef6ff" />
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS, segments, segments]} />
          <meshStandardMaterial color={0x16335c} emissive={0x040d1c} emissiveIntensity={0.4} roughness={0.85} metalness={0.05} />
        </mesh>
        <AtmosphereGlow radius={EARTH_RADIUS + 0.1} color="#4ac8ff" intensity={0.85} power={4.0} sunUniform={sunUniform} />
      </group>
    </>
  )
}

function Scene({ sunUniform, baseYaw, location, segments, quality }) {
  const { scene } = useThree()
  const [failed, setFailed] = useState(false)

  // Only enable mouse-drag rotation on devices with a real pointer; touch
  // devices keep auto-rotation so vertical page scrolling isn't trapped.
  const canRotate = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: fine)')?.matches,
    [],
  )

  useEffect(() => {
    scene.background = new THREE.Color(0x020509)
  }, [scene])

  const fallback = <FallbackEarth sunUniform={sunUniform} baseYaw={baseYaw} segments={Math.min(segments, 64)} />

  return (
    <>
      <Stars radius={160} depth={70} count={4200} factor={3.2} saturation={0.1} fade speed={0.25} />
      <ambientLight intensity={0.05} color="#0a1430" />
      <OrbitControls
        enableRotate={canRotate}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.45}
        autoRotate
        autoRotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.84}
      />
      <SceneErrorBoundary fallback={fallback}>
        {failed ? (
          fallback
        ) : (
          <TexturedEarth
            sunUniform={sunUniform}
            baseYaw={baseYaw}
            location={location}
            segments={segments}
            quality={quality}
            onError={() => setFailed(true)}
          />
        )}
      </SceneErrorBoundary>
      <AtmosphereGlow radius={EARTH_RADIUS + 0.1} color="#5ad4ff" intensity={1.05} power={4.8} sunUniform={sunUniform} />
      <AtmosphereGlow radius={EARTH_RADIUS + 0.32} color="#1a5fff" intensity={0.58} power={2.9} sunUniform={sunUniform} />
    </>
  )
}

function StaticFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'radial-gradient(circle at 38% 38%, #1b4f86 0%, #0a2950 38%, #051022 68%, #020509 100%)',
      }}
    />
  )
}

export default function HeroEarthCanvas() {
  const webglOk = useMemo(() => isWebGLAvailable(), [])
  const sunUniform = useMemo(() => ({ value: getSunDirection(new Date()) }), [])
  const [location, setLocation] = useState(null)
  const [baseYaw, setBaseYaw] = useState(0)

  // Pick a quality tier once from the device's capability and derive every
  // resolution/detail knob from it.
  const quality = useMemo(() => QUALITY[detectQualityTier()], [])
  const segments = quality.segments

  useEffect(() => {
    let cancelled = false
    fetchUserLocation().then((loc) => {
      if (cancelled || !loc) return
      setLocation(loc)
      const v = latLonToVector3(loc.lat, loc.lon, 1)
      setBaseYaw(-Math.atan2(v.x, v.z))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const update = () => getSunDirection(new Date(), sunUniform.value)
    update()
    const id = setInterval(update, SUN_REFRESH_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') update()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [sunUniform])

  if (!webglOk) return <StaticFallback />

  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      dpr={[1, quality.dpr]}
      performance={{ min: 0.5 }}
      frameloop="always"
      style={{ width: '100%', height: '100%', background: '#020509' }}
    >
      <Scene sunUniform={sunUniform} baseYaw={baseYaw} location={location} segments={segments} quality={quality} />
    </Canvas>
  )
}
