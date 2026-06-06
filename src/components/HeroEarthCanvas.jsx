import { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import { Component } from 'react'

const CDN = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets'
const DAY_URL = `${CDN}/earth_day_4096.jpg`
const NIGHT_URL = `${CDN}/earth_night_4096.jpg`
const NORMAL_URL = `${CDN}/earth_normal_2048.jpg`
const SPEC_URL = `${CDN}/earth_specular_2048.jpg`
const CLOUD_SOURCES = [
  '/assets/earth_clouds_2k.jpg',
  '/assets/earth_clouds.png',
  `${CDN}/earth_clouds_1024.png`,
]
const CLOUD_TEXEL = 'vec2(1.0 / 1024.0, 1.0 / 512.0)'

const CLOUD_SAMPLE_GLSL = `
float sampleCloudRaw(vec2 uv) {
  vec3 c = texture2D(uClouds, uv).rgb;
  return max(c.r, max(c.g, c.b));
}

float cloudDensitySoft(vec2 uv) {
  vec2 px = ${CLOUD_TEXEL};
  float d = sampleCloudRaw(uv) * 2.0;
  d += sampleCloudRaw(uv + vec2(px.x, 0.0)) * 0.65;
  d += sampleCloudRaw(uv - vec2(px.x, 0.0)) * 0.65;
  d += sampleCloudRaw(uv + vec2(0.0, px.y)) * 0.65;
  d += sampleCloudRaw(uv - vec2(0.0, px.y)) * 0.65;
  d += sampleCloudRaw(uv + px) * 0.4;
  d += sampleCloudRaw(uv - px) * 0.4;
  d /= 5.6;
  return pow(clamp(d, 0.0, 1.0), 0.9);
}
`

const EARTH_RADIUS = 2.4
const SEGMENTS = 256

const ATMOS_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ATMOS_FRAG = `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    float rim  = 1.0 - abs(dot(normalize(vNormal), normalize(-vViewPos)));
    float glow = pow(rim, power) * intensity;
    gl_FragColor = vec4(glowColor * glow, glow * 0.92);
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
    vec2 cloudUv = vec2(fract(vUv.x + uCloudPhase), vUv.y);
    float cloudDensity = cloudDensitySoft(cloudUv);

    float ndl = dot(normal, normalize(uSunDir));
    float dayMix = smoothstep(-0.12, 0.32, ndl);
    vec3 color = mix(nightCol * 1.35, dayCol, dayMix);
    color *= 1.0 - cloudDensity * uCloudShadow * dayMix;

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

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDirW = normalize(cameraPosition - worldPos.xyz);
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

  ${CLOUD_SAMPLE_GLSL}

  void main() {
    float density = cloudDensitySoft(vUv);
    float coverage = smoothstep(0.06, 0.34, density);

    vec3 sunDir = normalize(uSunDir);
    vec3 normal = normalize(vNormalW);
    vec3 viewDir = normalize(vViewDirW);
    float ndl = dot(normal, sunDir);
    float dayMix = smoothstep(-0.22, 0.48, ndl);

    vec3 dayCloud = mix(vec3(0.62, 0.66, 0.72), vec3(1.0, 0.99, 0.97), pow(max(ndl, 0.0), 0.35));
    vec3 nightCloud = vec3(0.08, 0.11, 0.18);
    vec3 cloudColor = mix(nightCloud, dayCloud, dayMix);

    float underside = smoothstep(0.05, -0.35, ndl);
    cloudColor *= mix(1.0, 0.72, underside * coverage);

    float terminator = pow(1.0 - abs(ndl), 4.0);
    cloudColor += vec3(0.95, 0.97, 1.0) * terminator * coverage * 0.42;

    float forwardScatter = pow(max(dot(viewDir, sunDir), 0.0), 10.0);
    cloudColor += vec3(1.0, 0.98, 0.94) * forwardScatter * coverage * 0.22 * dayMix;

    float alpha = coverage * mix(0.2, uOpacity, dayMix);
    gl_FragColor = vec4(cloudColor, clamp(alpha, 0.0, 0.82));
  }
`

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

function createEmptyCloudTexture() {
  const data = new Uint8Array([0, 0, 0, 255])
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat)
  texture.needsUpdate = true
  return texture
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

function AtmosphereGlow({ radius, color, intensity, power }) {
  const uniforms = useMemo(() => ({
    glowColor: { value: new THREE.Color(color) },
    intensity: { value: intensity },
    power: { value: power },
  }), [color, intensity, power])

  return (
    <mesh>
      <sphereGeometry args={[radius, 128, 128]} />
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

function CloudLayer({ cloudsRef, cloudUniforms, earthUniforms }) {
  const { gl } = useThree()
  const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16)
  const [clouds, setClouds] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loader = new TextureLoader()

    const applyCloud = (texture) => {
      if (cancelled) return
      configureTexture(texture, { srgb: true, anisotropy, repeat: true })
      setClouds(texture)
      cloudUniforms.uClouds.value = texture
      earthUniforms.uClouds.value = texture
    }

    const trySource = (index) => {
      if (cancelled || index >= CLOUD_SOURCES.length) return
      loader.load(
        CLOUD_SOURCES[index],
        applyCloud,
        undefined,
        () => trySource(index + 1),
      )
    }

    trySource(0)

    return () => { cancelled = true }
  }, [anisotropy, cloudUniforms, earthUniforms])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const rot = t * 0.036
    if (cloudsRef.current) cloudsRef.current.rotation.y = rot + t * 0.008
  })

  if (!clouds) return null

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[EARTH_RADIUS + 0.022, SEGMENTS, SEGMENTS]} />
      <shaderMaterial
        vertexShader={CLOUD_VERT}
        fragmentShader={CLOUD_FRAG}
        uniforms={cloudUniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}

function TexturedEarth() {
  const earthRef = useRef()
  const cloudsRef = useRef()
  const { gl } = useThree()
  const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16)

  const [day, night, normal, spec] = useLoader(TextureLoader, [
    DAY_URL, NIGHT_URL, NORMAL_URL, SPEC_URL,
  ])

  useMemo(() => {
    configureTexture(day, { srgb: true, anisotropy })
    configureTexture(night, { srgb: true, anisotropy })
    configureTexture(normal, { anisotropy })
    configureTexture(spec, { anisotropy })
  }, [day, night, normal, spec, anisotropy])

  const sunDir = useMemo(() => new THREE.Vector3(1, 0.25, 0.8).normalize(), [])
  const emptyClouds = useMemo(() => createEmptyCloudTexture(), [])

  const earthUniforms = useMemo(
    () => ({
      uDay: { value: day },
      uNight: { value: night },
      uNormal: { value: normal },
      uSpecular: { value: spec },
      uClouds: { value: emptyClouds },
      uSunDir: { value: sunDir },
      uCloudShadow: { value: 0.14 },
      uCloudPhase: { value: 0 },
    }),
    [day, night, normal, spec, emptyClouds, sunDir],
  )

  const cloudUniforms = useMemo(
    () => ({
      uClouds: { value: emptyClouds },
      uSunDir: { value: sunDir },
      uOpacity: { value: 0.68 },
    }),
    [emptyClouds, sunDir],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const rot = t * 0.036
    const cloudDrift = t * 0.008
    if (earthRef.current) earthRef.current.rotation.y = rot
    earthUniforms.uCloudPhase.value = cloudDrift / (Math.PI * 2)
  })

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, SEGMENTS, SEGMENTS]} />
        <shaderMaterial
          vertexShader={EARTH_VERT}
          fragmentShader={EARTH_FRAG}
          uniforms={earthUniforms}
        />
      </mesh>

      <CloudLayer
          cloudsRef={cloudsRef}
          cloudUniforms={cloudUniforms}
          earthUniforms={earthUniforms}
        />

      <AtmosphereGlow radius={EARTH_RADIUS + 0.1} color="#5ad4ff" intensity={1.05} power={4.8} />
      <AtmosphereGlow radius={EARTH_RADIUS + 0.32} color="#1a5fff" intensity={0.58} power={2.9} />
    </group>
  )
}

function FallbackEarth() {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.036
  })
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
        <meshStandardMaterial
          color={new THREE.Color(0x0c2244)}
          emissive={new THREE.Color(0x041020)}
          emissiveIntensity={0.45}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      <AtmosphereGlow radius={EARTH_RADIUS + 0.1} color="#4ac8ff" intensity={0.85} power={4.0} />
      <AtmosphereGlow radius={EARTH_RADIUS + 0.32} color="#1a5fff" intensity={0.45} power={2.6} />
    </group>
  )
}

function Scene() {
  return (
    <>
      <Stars radius={160} depth={70} count={9000} factor={3.2} saturation={0.1} fade speed={0.25} />
      <directionalLight position={[6, 2.5, 5]} intensity={2.4} color="#eef6ff" />
      <directionalLight position={[-5, -1.5, -4]} intensity={0.12} color="#1a2850" />
      <ambientLight intensity={0.04} color="#030b20" />
      <pointLight position={[0, 0, 6.5]} intensity={0.22} color="#29b6ff" />
      <SceneErrorBoundary fallback={<FallbackEarth />}>
        <Suspense fallback={<FallbackEarth />}>
          <TexturedEarth />
        </Suspense>
      </SceneErrorBoundary>
    </>
  )
}

export default function HeroEarthCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene />
    </Canvas>
  )
}
