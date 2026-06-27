import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 18, mass: 0.3 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 18, mass: 0.3 })

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) return

    function onMouseMove(e: MouseEvent) {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [mouseX, mouseY])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-[9999] w-2 h-2 rounded-full bg-[#D9A35F] -translate-x-1/2 -translate-y-1/2"
        style={{ left: mouseX, top: mouseY }}
      />
      <motion.div
        className="pointer-events-none fixed z-[9998] w-8 h-8 rounded-full border border-[#D9A35F]/60 -translate-x-1/2 -translate-y-1/2"
        style={{ left: springX, top: springY }}
      />
    </>
  )
}
