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

      // 1. Draw subtle background cybergrid lines
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.04)'
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
      ctx.strokeStyle = '#39FF14'
      ctx.shadowBlur = 10
      ctx.shadowColor = 'rgba(57, 255, 20, 0.65)' // Enforce native GPU glow filtering

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
      ctx.fillStyle = '#FF007F' // High-glow Pink dot
      ctx.shadowBlur = 12
      ctx.shadowColor = '#FF007F'
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
