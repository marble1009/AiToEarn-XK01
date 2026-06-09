'use client'

import React, { useEffect, useRef } from 'react'

export default function CanvasLineChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let offset = 0

    // Prevent blur on high-DPI (Retina) screens
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.resetTransform()
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // 1. Draw subtle background cozy grid lines
      ctx.strokeStyle = 'rgba(95, 122, 97, 0.06)'
      ctx.lineWidth = 1
      for (let i = 0; i < rect.width; i += 24) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, rect.height)
        ctx.stroke()
      }

      // 2. Draw glowing quantum flux wave (Combination of Sin waves)
      ctx.beginPath()
      ctx.lineWidth = 2.5
      ctx.strokeStyle = '#5F7A61'
      ctx.shadowBlur = 4
      ctx.shadowColor = 'rgba(95, 122, 97, 0.25)' // Soft diffuse shadow

      for (let x = 0; x < rect.width; x++) {
        const y =
          rect.height * 0.55 +
          Math.sin(x * 0.015 + offset) * 12 +
          Math.cos(x * 0.04 + offset * 0.6) * 6
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      
      // 3. Draw neon active pulse particle at the terminal wave edge
      const headX = rect.width - 4
      const headY =
        rect.height * 0.55 +
        Math.sin(headX * 0.015 + offset) * 12 +
        Math.cos(headX * 0.04 + offset * 0.6) * 6

      ctx.beginPath()
      ctx.arc(headX, headY, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#F3A390' // Warm Sunset Peach dot
      ctx.shadowBlur = 6
      ctx.shadowColor = '#F3A390'
      ctx.fill()

      // Reset shadow configuration to avoid leakage on other elements
      ctx.shadowBlur = 0

      offset += 0.02
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-16 opacity-85 pointer-events-none will-change-transform"
      style={{ backfaceVisibility: 'hidden' }}
    />
  )
}
