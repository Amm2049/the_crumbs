'use client'

import { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({ children, className = "", delay = "" }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${className} transition-opacity duration-300 ${
        isVisible ? 'animate-fade-up' : 'opacity-0'
      } ${delay}`}
    >
      {children}
    </div>
  )
}
