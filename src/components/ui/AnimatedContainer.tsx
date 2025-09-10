'use client'

import { motion, HTMLMotionProps, Variants } from 'framer-motion'
import { forwardRef } from 'react'
import { useScrollAnimation, useResponsiveAnimation } from '@/hooks/useAnimation'
import { cn } from '@/lib/utils'

interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInFromBottom' | 'none'
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
  stagger?: boolean
  children: React.ReactNode
}

const animations: Record<string, Variants> = {
  fadeInUp: {
    initial: { opacity: 0, y: 40, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  fadeInDown: {
    initial: { opacity: 0, y: -40 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -40 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  fadeInRight: {
    initial: { opacity: 0, x: 40 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  slideInFromBottom: {
    initial: { opacity: 0, y: 100 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.17, 0.67, 0.83, 0.67] }
    }
  }
}

export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ 
    animation = 'fadeInUp', 
    delay = 0, 
    duration, 
    threshold = 0.1, 
    once = true, 
    stagger = false,
    className,
    children,
    ...props 
  }, ref) => {
    const { controls } = useScrollAnimation(threshold, once)
    const { getAnimationProps, prefersReducedMotion } = useResponsiveAnimation()

    // Return simple div if reduced motion is preferred
    if (prefersReducedMotion || animation === 'none') {
      return (
        <div ref={ref} className={className} {...props as any}>
          {children}
        </div>
      )
    }

    const animationVariant = animations[animation]
    const responsiveProps = getAnimationProps(animationVariant)

    // Add custom duration and delay if provided
    if (duration || delay) {
      responsiveProps.animate = {
        ...responsiveProps.animate,
        transition: {
          ...responsiveProps.animate.transition,
          ...(duration && { duration }),
          delay
        }
      }
    }

    // Add stagger effect if enabled
    if (stagger) {
      responsiveProps.animate = {
        ...responsiveProps.animate,
        transition: {
          ...responsiveProps.animate.transition,
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    }

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={responsiveProps}
        initial="initial"
        whileInView="animate"
        viewport={{ once, amount: threshold }}
        animate={controls}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedContainer.displayName = 'AnimatedContainer'

// Specialized animated containers
export const FadeInContainer = forwardRef<HTMLDivElement, Omit<AnimatedContainerProps, 'animation'>>(
  (props, ref) => <AnimatedContainer ref={ref} animation="fadeInUp" {...props} />
)

export const SlideInContainer = forwardRef<HTMLDivElement, Omit<AnimatedContainerProps, 'animation'>>(
  (props, ref) => <AnimatedContainer ref={ref} animation="slideInFromBottom" {...props} />
)

export const ScaleInContainer = forwardRef<HTMLDivElement, Omit<AnimatedContainerProps, 'animation'>>(
  (props, ref) => <AnimatedContainer ref={ref} animation="scaleIn" {...props} />
)

// Staggered container for animating multiple children
interface StaggeredContainerProps extends Omit<AnimatedContainerProps, 'stagger'> {
  staggerDelay?: number
}

export const StaggeredContainer = forwardRef<HTMLDivElement, StaggeredContainerProps>(
  ({ staggerDelay = 0.1, children, ...props }, ref) => {
    const { getStaggerDelay } = useResponsiveAnimation()

    const staggerVariants: Variants = {
      initial: {},
      animate: {
        transition: {
          staggerChildren: getStaggerDelay(1),
          delayChildren: 0.2
        }
      }
    }

    return (
      <motion.div
        ref={ref}
        variants={staggerVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

// Grid container with staggered animations
interface AnimatedGridProps extends HTMLMotionProps<'div'> {
  columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  gap?: number
  children: React.ReactNode
}

export const AnimatedGrid = forwardRef<HTMLDivElement, AnimatedGridProps>(
  ({ columns = { xs: 1, sm: 2, md: 3, lg: 4 }, gap = 4, className, children, ...props }, ref) => {
    const gridClass = cn(
      'grid',
      `gap-${gap}`,
      columns.xs && `grid-cols-${columns.xs}`,
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`,
      className
    )

    return (
      <StaggeredContainer ref={ref} className={gridClass} {...props}>
        {children}
      </StaggeredContainer>
    )
  }
)

// Text animation container
interface AnimatedTextProps extends HTMLMotionProps<'div'> {
  text: string
  animation?: 'typewriter' | 'fadeInWords' | 'slideInChars'
  delay?: number
  speed?: number
}

export const AnimatedText = forwardRef<HTMLDivElement, AnimatedTextProps>(
  ({ text, animation = 'fadeInWords', delay = 0, speed = 0.05, className, ...props }, ref) => {
    const variants: Variants = {
      initial: {},
      animate: {
        transition: {
          staggerChildren: speed,
          delayChildren: delay
        }
      }
    }

    const itemVariants: Variants = {
      initial: { opacity: 0, y: 10 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3 }
      }
    }

    if (animation === 'fadeInWords') {
      return (
        <motion.div
          ref={ref}
          className={className}
          variants={variants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          {...props}
        >
          {text.split(' ').map((word, index) => (
            <motion.span
              key={index}
              variants={itemVariants}
              className="inline-block mr-1"
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      )
    }

    if (animation === 'slideInChars') {
      return (
        <motion.div
          ref={ref}
          className={className}
          variants={variants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          {...props}
        >
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={itemVariants}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>
      )
    }

    // Default fallback
    return (
      <div ref={ref} className={className} {...props as any}>
        {text}
      </div>
    )
  }
)

AnimatedText.displayName = 'AnimatedText'

// Reveal container that shows content on scroll
interface RevealContainerProps extends HTMLMotionProps<'div'> {
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  children: React.ReactNode
}

export const RevealContainer = forwardRef<HTMLDivElement, RevealContainerProps>(
  ({ direction = 'up', distance = 40, className, children, ...props }, ref) => {
    const getInitialTransform = () => {
      switch (direction) {
        case 'up': return { y: distance, opacity: 0 }
        case 'down': return { y: -distance, opacity: 0 }
        case 'left': return { x: distance, opacity: 0 }
        case 'right': return { x: -distance, opacity: 0 }
        default: return { y: distance, opacity: 0 }
      }
    }

    const variants: Variants = {
      initial: getInitialTransform(),
      animate: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    }

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={variants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

RevealContainer.displayName = 'RevealContainer'

FadeInContainer.displayName = 'FadeInContainer'
SlideInContainer.displayName = 'SlideInContainer'
ScaleInContainer.displayName = 'ScaleInContainer'
StaggeredContainer.displayName = 'StaggeredContainer'
AnimatedGrid.displayName = 'AnimatedGrid'