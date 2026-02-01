import { useEffect, useState } from 'react'

export const useAnimation = (
  trigger: boolean,
  duration: number = 300
) => {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return shouldAnimate
}

export const useStaggeredAnimation = (
  itemCount: number,
  baseDelay: number = 100
) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => new Set(prev).add(i))
      }, i * baseDelay)
      timers.push(timer)
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [itemCount, baseDelay])

  return visibleItems
}

export const useScrollAnimation = (
  threshold: number = 0.1
) => {
  const [isVisible, setIsVisible] = useState(false)
  const [element, setElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [element, threshold])

  return { isVisible, setElement }
}
