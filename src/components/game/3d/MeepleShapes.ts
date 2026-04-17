import * as THREE from 'three'

export const SCALE_FACTOR = 8.8 / 45

export const MEEPLE_DIMENSIONS = {
  NORMAL: { width: 16, height: 15.98, depth: 9.94 },
  BIG: { width: 18.5, height: 19.28, depth: 9.88 },
  BUILDER: { width: 14.29, height: 20.52, depth: 9.80 },
  PIG: { width: 22.11, height: 11.15, depth: 8.01 },
  COUNT: { width: 19.40, height: 29.02, depth: 10.99 },
  FAIRY: { width: 10.62, height: 18.05, depth: 10.11 },
  DRAGON: { width: 52.80, height: 24.88, depth: 12.03 },
  TILE: { width: 45, height: 45, depth: 2 },
}

export function createRegularMeepleShape() {
  const s = new THREE.Shape()
  // Centered: Subtract (8.00, 7.99)
  s.moveTo(0.00, -7.99)
  s.bezierCurveTo(1.92, -7.99, 2.40, -6.07, 2.40, -4.95)
  s.bezierCurveTo(4.00, -3.99, 6.88, -2.56, 7.36, -1.99)
  s.bezierCurveTo(8.00, -1.44, 8.00, -0.48, 7.52, 0.01)
  s.bezierCurveTo(6.08, 0.96, 3.52, 0.48, 3.52, 0.48)
  s.bezierCurveTo(4.00, 3.04, 5.44, 7.03, 5.44, 7.51)
  s.bezierCurveTo(5.44, 7.99, 4.00, 7.99, 1.92, 7.99)
  s.lineTo(1.44, 7.99)
  s.bezierCurveTo(0.48, 5.91, 0.00, 4.47, 0.00, 4.47)
  s.bezierCurveTo(0.00, 4.47, -0.48, 5.91, -1.44, 7.99)
  s.lineTo(-1.92, 7.99)
  s.bezierCurveTo(-4.00, 7.99, -5.44, 7.99, -5.44, 7.51)
  s.bezierCurveTo(-5.44, 7.03, -4.00, 3.04, -3.52, 0.48)
  s.bezierCurveTo(-3.52, 0.48, -6.08, 0.96, -7.52, 0.01)
  s.bezierCurveTo(-8.00, -0.48, -8.00, -1.44, -7.36, -1.99)
  s.bezierCurveTo(-6.88, -2.56, -4.00, -3.99, -2.40, -4.95)
  s.bezierCurveTo(-2.40, -6.07, -1.92, -7.99, 0.00, -7.99)
  return s
}

export function createBigMeepleShape() {
  const s = new THREE.Shape()
  // Centered: Subtract (9.25, 9.64)
  s.moveTo(0.00, -9.64)
  s.bezierCurveTo(2.22, -9.64, 2.78, -7.33, 2.78, -5.98)
  s.bezierCurveTo(4.63, -4.82, 7.95, -3.08, 8.51, -2.41)
  s.bezierCurveTo(9.25, -1.74, 9.25, -0.58, 8.70, 0.00)
  s.bezierCurveTo(7.03, 1.16, 4.07, 0.58, 4.07, 0.58)
  s.bezierCurveTo(4.63, 3.66, 6.29, 8.48, 6.29, 9.06)
  s.bezierCurveTo(6.29, 9.64, 4.63, 9.64, 2.22, 9.64)
  s.lineTo(1.67, 9.64)
  s.bezierCurveTo(0.55, 7.13, 0.00, 5.40, 0.00, 5.40)
  s.bezierCurveTo(0.00, 5.40, -0.55, 7.13, -1.67, 9.64)
  s.lineTo(-2.22, 9.64)
  s.bezierCurveTo(-4.63, 9.64, -6.29, 9.64, -6.29, 9.06)
  s.bezierCurveTo(-6.29, 8.48, -4.63, 3.66, -4.07, 0.58)
  s.bezierCurveTo(-4.07, 0.58, -7.03, 1.16, -8.70, 0.00)
  s.bezierCurveTo(-9.25, -0.58, -9.25, -1.74, -8.51, -2.41)
  s.bezierCurveTo(-7.95, -3.08, -4.63, -4.82, -2.78, -5.98)
  s.bezierCurveTo(-2.78, -7.33, -2.22, -9.64, 0.00, -9.64)
  return s
}

export function createBuilderShape() {
  const s = new THREE.Shape()
  // Centered: Subtract (7.145, 10.26)
  s.moveTo(0.00, -10.26)
  s.bezierCurveTo(2.855, -10.26, 3.355, -7.26, 3.355, -5.26)
  s.bezierCurveTo(7.145, -5.26, 7.145, -3.26, 7.145, -1.26)
  s.bezierCurveTo(7.145, 0.74, 3.855, 0.74, 3.355, 0.74)
  s.bezierCurveTo(3.855, 5.74, 5.855, 10.26, 5.855, 10.26)
  s.lineTo(-5.855, 10.26)
  s.bezierCurveTo(-5.855, 10.26, -3.855, 5.74, -3.355, 0.74)
  s.bezierCurveTo(-3.855, 0.74, -7.145, 0.74, -7.145, -1.26)
  s.bezierCurveTo(-7.145, -3.26, -7.145, -5.26, -3.355, -5.26)
  s.bezierCurveTo(-3.355, -7.26, -2.855, -10.26, 0.00, -10.26)
  return s
}

export function createPigShape() {
  const s = new THREE.Shape()
  // Centered: Subtract (11.055, 5.575)
  s.moveTo(4.945, -5.575)
  s.bezierCurveTo(6.945, -3.575, 8.945, -1.575, 11.055, 0.425)
  s.bezierCurveTo(11.055, 2.425, 8.945, 2.425, 6.945, 1.925)
  s.bezierCurveTo(6.945, 3.425, 5.945, 5.575, 5.945, 5.575)
  s.lineTo(2.945, 5.575)
  s.bezierCurveTo(2.945, 3.925, 1.945, 3.425, -3.055, 3.425)
  s.bezierCurveTo(-6.055, 3.425, -6.055, 5.575, -6.055, 5.575)
  s.lineTo(-9.055, 5.575)
  s.bezierCurveTo(-9.055, 3.425, -11.055, 2.425, -11.055, 0.425)
  s.bezierCurveTo(-11.055, -2.575, -6.055, -4.575, -1.055, -4.575)
  s.bezierCurveTo(1.945, -4.575, 3.945, -5.575, 4.945, -5.575)
  return s
}

export function createCountShape() {
  const s = new THREE.Shape()
  // Centered: Subtract (9.70, 14.51)
  s.moveTo(-3.70, -14.51)
  s.lineTo(3.70, -14.51)
  s.lineTo(3.70, -8.51)
  s.lineTo(6.70, -8.51)
  s.lineTo(6.70, -7.51)
  s.lineTo(2.70, -7.51)
  s.bezierCurveTo(2.70, -4.51, 4.30, 0.49, 9.70, 14.51)
  s.lineTo(-9.70, 14.51)
  s.bezierCurveTo(-4.30, 0.49, -2.70, -4.51, -2.70, -7.51)
  s.lineTo(-6.70, -7.51)
  s.lineTo(-6.70, -8.51)
  s.lineTo(-3.70, -8.51)
  return s
}

export function createFairyShape() {
  const s = new THREE.Shape()
  // Centered: Subtract (5.31, 9.025)
  s.moveTo(0.00, -9.025)
  s.bezierCurveTo(1.69, -7.025, 2.19, -5.025, 2.19, -3.025)
  s.bezierCurveTo(5.31, -2.025, 5.31, -0.025, 3.69, 0.975)
  s.bezierCurveTo(2.69, 1.475, 1.69, 0.975, 1.69, 0.975)
  s.bezierCurveTo(2.69, 4.975, 5.31, 9.025, 5.31, 9.025)
  s.lineTo(-5.31, 9.025)
  s.bezierCurveTo(-5.31, 9.025, -2.69, 4.975, -1.69, 0.975)
  s.bezierCurveTo(-1.69, 0.975, -2.69, 1.475, -3.69, 0.975)
  s.bezierCurveTo(-5.31, -0.025, -5.31, -2.025, -2.19, -3.025)
  s.bezierCurveTo(-2.19, -5.025, -1.69, -7.025, 0.00, -9.025)
  return s
}

export function createDragonShape() {
  const s = new THREE.Shape()
  // Centered: Subtract (26.40, 12.44)
  s.moveTo(-10.40, -7.44)
  s.lineTo(-8.40, -8.44)
  s.lineTo(-7.90, -6.44)
  s.lineTo(-6.40, -7.44)
  s.lineTo(-5.40, -4.44)
  s.bezierCurveTo(-1.40, -4.44, 1.60, -8.44, 3.60, -12.44)
  s.bezierCurveTo(5.60, -4.44, 9.60, -0.44, 15.60, 1.56)
  s.bezierCurveTo(19.60, 1.56, 21.60, -0.44, 23.60, -1.44)
  s.lineTo(24.60, -3.44)
  s.lineTo(26.40, -1.44)
  s.lineTo(24.60, 1.56)
  s.lineTo(22.60, 4.56)
  s.lineTo(19.60, 3.56)
  s.bezierCurveTo(15.60, 5.56, 13.60, 9.56, 13.60, 12.44)
  s.lineTo(1.60, 12.44)
  s.bezierCurveTo(1.60, 7.56, -2.40, 7.56, -6.40, 12.44)
  s.lineTo(-16.40, 12.44)
  s.bezierCurveTo(-16.40, 7.56, -12.40, 3.56, -12.40, 1.56)
  s.bezierCurveTo(-18.40, 1.56, -26.40, -0.44, -26.40, -4.44)
  s.bezierCurveTo(-26.40, -8.44, -20.40, -8.44, -16.40, -6.44)
  s.bezierCurveTo(-14.40, -8.44, -12.40, -7.44, -10.40, -7.44)
  return s
}
