
import { useEffect, useRef } from 'react'
import type { World } from '../simulation/world/world'

interface WorldCanvasProps {
  world: World
}

function WorldCanvas({ world }: WorldCanvasProps) {
  const canvas_ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvas_ref.current

    if (!canvas) return

    const context = canvas.getContext('2d')

    if (!context) return

    const render = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixel_ratio = window.devicePixelRatio || 1

      canvas.width = Math.max(1, Math.floor(bounds.width * pixel_ratio))
      canvas.height = Math.max(1, Math.floor(bounds.height * pixel_ratio))

      context.setTransform(pixel_ratio, 0, 0, pixel_ratio, 0, 0)

      context.fillStyle = '#0b1017'
      context.fillRect(0, 0, bounds.width, bounds.height)

      const scale_x = bounds.width / world.width
      const scale_y = bounds.height / world.height

      context.strokeStyle = 'rgba(148, 163, 184, 0.06)'
      context.lineWidth = 1

      for (let x = 0; x <= bounds.width; x += 40) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, bounds.height)
        context.stroke()
      }

      for (let y = 0; y <= bounds.height; y += 40) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(bounds.width, y)
        context.stroke()
      }

      for (const food of world.food) {
        const x = food.x * scale_x
        const y = food.y * scale_y

        context.beginPath()
        context.arc(x, y, 3, 0, Math.PI * 2)
        context.fillStyle = '#8bd450'
        context.fill()
      }

      for (const organism of world.organisms) {
        const x = organism.x * scale_x
        const y = organism.y * scale_y

        context.beginPath()
        context.arc(x, y, 9, 0, Math.PI * 2)
        context.fillStyle = 'rgba(56, 189, 248, 0.12)'
        context.fill()

        context.beginPath()
        context.arc(x, y, 5, 0, Math.PI * 2)
        context.fillStyle = '#38bdf8'
        context.fill()

        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(
          x + Math.cos(organism.angle) * 12,
          y + Math.sin(organism.angle) * 12
        )
        context.strokeStyle = '#bae6fd'
        context.lineWidth = 1.5
        context.stroke()
      }
    }

    const observer = new ResizeObserver(render)

    observer.observe(canvas)
    render()

    return () => observer.disconnect()
  }, [world])

  return (
    <canvas
      ref={canvas_ref}
      className="world-canvas"
      aria-label="Visualização do ecossistema"
      role="img"
    />
  )
}

export default WorldCanvas
