import { memo, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { useTexture, Text } from '@react-three/drei'
// @ts-ignore
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { SCALE_FACTOR, MEEPLE_DIMENSIONS } from './MeepleShapes'

const TILE_SIZE = 8.8 // Mapping 88px to 8.8 world units for scale consistency
const TILE_THICKNESS = MEEPLE_DIMENSIONS.TILE.depth * SCALE_FACTOR

// Module-level caches. These live for the tab lifetime so they survive
// component remounts during a game session — no disposal churn.

// Cached SVG parse result per svgPath. Shape points are deterministic per path.
type ParsedSvg = { shapes: THREE.Shape[] | null, points: THREE.Vector2[] | null, isClosed: boolean }
const svgParseCache = new Map<string, ParsedSvg>()

function getParsedSvg(svgPath: string): ParsedSvg | null {
  const cached = svgParseCache.get(svgPath)
  if (cached) return cached
  try {
    const loader = new SVGLoader()
    const result = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}" /></svg>`)
    const path = result.paths[0]
    if (!path) return null
    const isClosed = svgPath.toLowerCase().includes('z')
    const parsed: ParsedSvg = isClosed
      ? { shapes: SVGLoader.createShapes(path), points: null, isClosed: true }
      : { shapes: null, points: path.subPaths[0]?.getPoints() ?? null, isClosed: false }
    svgParseCache.set(svgPath, parsed)
    return parsed
  } catch (e) {
    console.error('Error parsing SVG path:', svgPath, e)
    return null
  }
}

// Cached stripe canvas texture per color signature (same across all tiles).
const stripeTextureCache = new Map<string, THREE.CanvasTexture>()

function getStripeTexture(colors: string[]): THREE.CanvasTexture | null {
  const key = colors.join('|')
  const cached = stripeTextureCache.get(key)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.clearRect(0, 0, 64, 64)
  const stripeWidth = 64 / colors.length
  colors.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.fillRect(i * stripeWidth, 0, stripeWidth / 2, 64)
  })
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  stripeTextureCache.set(key, t)
  return t
}

// Shared ShaderMaterial per color signature. Uses modelMatrix in the vertex shader
// to sample the stripe texture at world-space position → stripes stay aligned
// across tiles regardless of rotation.
const stripeMaterialCache = new Map<string, THREE.ShaderMaterial>()

function getStripeMaterial(colors: string[]): THREE.ShaderMaterial | null {
  const key = colors.join('|')
  const cached = stripeMaterialCache.get(key)
  if (cached) return cached
  const texture = getStripeTexture(colors)
  if (!texture) return null
  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      stripePeriod: { value: 1.5 },
      opacity: { value: 0.7 },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float stripePeriod;
      uniform float opacity;
      varying vec3 vWorldPos;
      void main() {
        float u = (vWorldPos.x + vWorldPos.z) / stripePeriod;
        vec4 c = texture2D(map, vec2(u, 0.5));
        if (c.a < 0.01) discard;
        gl_FragColor = vec4(c.rgb, c.a * opacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
  stripeMaterialCache.set(key, material)
  return material
}

interface Tile3DProps {
  tile: any
  definition: any
  staticTileMap?: Record<string, any>
  onClick?: (e: any) => void
  onPointerOver?: (e: any) => void
  onPointerOut?: (e: any) => void
  isTentative?: boolean
  renderLinked?: boolean
  segmentOwnerColors?: Record<string, string[]>
}

const SegmentOwnership3D = memo(function SegmentOwnership3D({ colors, segment }: { colors: string[], segment: any }) {
  const material = useMemo(() => getStripeMaterial(colors), [colors.join('|')])

  const geometry = useMemo(() => {
    if (!segment.svgPath) return null
    const parsed = getParsedSvg(segment.svgPath)
    if (!parsed) return null

    let finalGeometry: THREE.BufferGeometry | null = null

    if (parsed.isClosed && parsed.shapes) {
      finalGeometry = new THREE.ShapeGeometry(parsed.shapes)
    } else if (parsed.points) {
      const points = parsed.points
      if (points.length < 2) return null

      const ribbonWidth = 8
      const ribbonShape = new THREE.Shape()

      const leftPoints: THREE.Vector2[] = []
      const rightPoints: THREE.Vector2[] = []

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const next = points[i + 1] || points[i]
        const prev = points[i - 1] || points[i]

        const dir = new THREE.Vector2().subVectors(next, prev).normalize()
        const normal = new THREE.Vector2(-dir.y, dir.x)

        leftPoints.push(new THREE.Vector2().addVectors(p, normal.clone().multiplyScalar(ribbonWidth / 2)))
        rightPoints.push(new THREE.Vector2().addVectors(p, normal.clone().multiplyScalar(-ribbonWidth / 2)))
      }

      ribbonShape.moveTo(leftPoints[0].x, leftPoints[0].y)
      for (let i = 1; i < leftPoints.length; i++) ribbonShape.lineTo(leftPoints[i].x, leftPoints[i].y)
      for (let i = rightPoints.length - 1; i >= 0; i--) ribbonShape.lineTo(rightPoints[i].x, rightPoints[i].y)
      ribbonShape.closePath()

      finalGeometry = new THREE.ShapeGeometry(ribbonShape)
    }

    if (finalGeometry) {
      // Shader derives UV from world-space modelMatrix → no manual rotation math needed.
      // Geometry stays in its natural SVG-local orientation; parent group handles rotation.
      const scale = TILE_SIZE / 100
      finalGeometry.scale(scale, -scale, 1)
      finalGeometry.translate(-TILE_SIZE / 2, TILE_SIZE / 2, 0)
    }

    return finalGeometry
  }, [segment.svgPath])

  if (!material || !geometry) return null

  return (
    <mesh geometry={geometry} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={material} attach="material" />
    </mesh>
  )
})

function TileTexture({ imageUrl, imageConfig }: { imageUrl?: string, imageConfig?: any }) {
  if (!imageUrl) return <meshStandardMaterial color="#dddddd" roughness={0.8} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
  return <LoadedTileTexture imageUrl={imageUrl} imageConfig={imageConfig} />
}

// Cache configured tile textures by (imageUrl + imageConfig). Lives for the tab.
// All tiles with the same definition share the same texture instance → no clone churn.
const tileTextureCache = new Map<string, THREE.Texture>()

function getConfiguredTileTexture(baseTexture: THREE.Texture, imageUrl: string, imageConfig?: any): THREE.Texture {
  const cfgKey = imageConfig ? JSON.stringify(imageConfig) : ''
  const key = `${imageUrl}::${cfgKey}`
  const cached = tileTextureCache.get(key)
  if (cached) return cached
  const t = baseTexture.clone()
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 16
  t.needsUpdate = true
  if (imageConfig) {
    t.repeat.set(1 / (imageConfig.widthFactor || 1), 1 / (imageConfig.heightFactor || 1))
    const offsetX = imageConfig.offsetX || 0
    const offsetY = imageConfig.offsetY || 0
    t.offset.set(offsetX, 1 - (1 / (imageConfig.heightFactor || 1)) - offsetY)
  }
  tileTextureCache.set(key, t)
  return t
}

function LoadedTileTexture({ imageUrl, imageConfig }: { imageUrl: string, imageConfig?: any }) {
  const baseTexture = useTexture(imageUrl)
  const texture = useMemo(
    () => (baseTexture ? getConfiguredTileTexture(baseTexture, imageUrl, imageConfig) : null),
    [baseTexture, imageUrl, imageConfig]
  )

  if (!texture) return <meshStandardMaterial color="#cccccc" polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />

  return <meshStandardMaterial map={texture} roughness={0.6} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
}

function Tile3DImpl({
  tile,
  definition,
  staticTileMap,
  onClick,
  onPointerOver,
  onPointerOut,
  isTentative = false,
  renderLinked = false,
  segmentOwnerColors = {}
}: Tile3DProps) {
  // Composite footprint calculation
  const footprints = useMemo(() => {
    const base = [{ dx: 0, dy: 0, def: definition }]
    if (renderLinked && definition.linkedTiles && definition.linkedTiles.length > 0) {
      const extra = definition.linkedTiles.map((lt: any) => {
        const linkedDef = staticTileMap ? staticTileMap[lt.definitionId] : definition
        return { dx: lt.dx, dy: lt.dy, def: linkedDef || definition }
      })
      return [...base, ...extra]
    }
    return base
  }, [definition, staticTileMap, renderLinked])

  const { x, y } = tile.coordinate
  const rx = (tile.rotation || 0) * (Math.PI / 180)

  return (
    <group position={[x * TILE_SIZE, 0, y * TILE_SIZE]} rotation={[0, -rx, 0]}>
      {footprints.map((fp, idx) => (
        <group key={idx} position={[fp.dx * TILE_SIZE, 0, fp.dy * TILE_SIZE]}>
          <mesh
            position={[0, -TILE_THICKNESS / 2, 0]}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            castShadow
          >
            <boxGeometry args={[TILE_SIZE - 0.05, TILE_THICKNESS, TILE_SIZE - 0.05]} />
            <meshStandardMaterial 
              color={isTentative ? "#aaddff" : "#8b857a"} 
              transparent={isTentative}
              opacity={isTentative ? 0.7 : 1}
              roughness={0.9}
            />
          </mesh>
          
          {/* Top surface for texture */}
          <mesh
            position={[0, 0.05, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
          >
            <planeGeometry args={[TILE_SIZE - 0.1, TILE_SIZE - 0.1]} />
            <Suspense fallback={<meshStandardMaterial color="#cccccc" polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />}>
              <TileTexture imageUrl={fp.def.imageUrl} imageConfig={fp.def.imageConfig} />
            </Suspense>
          </mesh>

          {/* Tile ID label */}
          <Text
            position={[TILE_SIZE / 2 - 0.3, 0.08, TILE_SIZE / 2 - 0.7]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.6}
            color="#ffffff"
            outlineWidth={0.05}
            outlineColor="#000000"
            anchorX="right"
            anchorY="middle"
          >
            {fp.def.id}
          </Text>

          {/* Ownership Overlays */}
          {Object.entries(segmentOwnerColors).map(([segId, colors]) => {
            const seg = fp.def.segments.find((s: any) => s.id === segId)
            if (!seg) return null
            return (
              <SegmentOwnership3D
                key={segId}
                colors={colors}
                segment={seg}
              />
            )
          })}
        </group>
      ))}
    </group>
  )
}

function segmentOwnerColorsEqual(
  a: Record<string, string[]> = {},
  b: Record<string, string[]> = {}
): boolean {
  if (a === b) return true
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const k of aKeys) {
    const av = a[k], bv = b[k]
    if (!bv || av.length !== bv.length) return false
    for (let i = 0; i < av.length; i++) if (av[i] !== bv[i]) return false
  }
  return true
}

export const Tile3D = memo(Tile3DImpl, (prev, next) => (
  prev.tile === next.tile &&
  prev.definition === next.definition &&
  prev.staticTileMap === next.staticTileMap &&
  prev.isTentative === next.isTentative &&
  prev.renderLinked === next.renderLinked &&
  prev.onClick === next.onClick &&
  prev.onPointerOver === next.onPointerOver &&
  prev.onPointerOut === next.onPointerOut &&
  segmentOwnerColorsEqual(prev.segmentOwnerColors, next.segmentOwnerColors)
))
