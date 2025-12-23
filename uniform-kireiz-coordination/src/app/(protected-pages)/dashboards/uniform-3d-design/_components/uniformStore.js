import { proxy } from 'valtio'

export const uniformState = proxy({
  color: '#7fc7ff',
  active3dPart:'',
  autoRotate: true,
})