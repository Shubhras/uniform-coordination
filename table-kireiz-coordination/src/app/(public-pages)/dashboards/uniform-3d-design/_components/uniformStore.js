import { proxy } from 'valtio'

/**
 * Valtio proxy state store for managing 3D model colors, active mesh parts, and camera rotation.
 */
export const uniformState = proxy({
  color: '#7fc7ff',
  active3dPart: '',
  partColors: {},
  autoRotate: false,
})