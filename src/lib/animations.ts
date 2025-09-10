'use client'

import { Variants, Transition, MotionValue, useAnimation } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

// Animation variants for common patterns
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.21, 1.11, 0.81, 0.99],
      staggerChildren: 0.1
    }
  }
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -60
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
}

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -60
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 60
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const slideInFromBottom: Variants = {
  initial: {
    opacity: 0,
    y: 100
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.17, 0.67, 0.83, 0.67]
    }
  }
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
}

// Page transition variants
export const pageTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  slideFromRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

// Loading animation variants
export const loadingAnimations = {
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  skeleton: {
    animate: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
}

// Hover and interaction animations
export const hoverAnimations = {
  lift: {
    whileHover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    whileTap: {
      scale: 0.98,
      y: -4,
      transition: {
        duration: 0.1
      }
    }
  },
  scale: {
    whileHover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    whileTap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  },
  button: {
    whileHover: {
      scale: 1.02,
      y: -2,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    whileTap: {
      scale: 0.98,
      y: 0,
      transition: {
        duration: 0.1
      }
    }
  }
}

// Spring configurations for different animation types
export const springs = {
  gentle: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 1
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
    mass: 0.8
  },
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 1
  },
  wobbly: {
    type: 'spring',
    stiffness: 180,
    damping: 12,
    mass: 1
  }
} as const

// Easing functions
export const easings = {
  easeInOutCubic: [0.4, 0, 0.2, 1],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInCubic: [0.32, 0, 0.67, 0],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
} as const

// Animation timing functions
export const timing = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
} as const

// Responsive animation utilities
export const getResponsiveDelay = (index: number, isMobile: boolean = false): number => {
  const baseDelay = isMobile ? 0.05 : 0.1
  return index * baseDelay
}

export const getResponsiveDuration = (baseDuration: number, isMobile: boolean = false): number => {
  return isMobile ? baseDuration * 0.8 : baseDuration
}

// Performance optimized animation settings
export const performanceSettings = {
  // Use will-change for better performance
  willChange: 'transform, opacity',
  
  // Reduce animations on slow devices
  reducedMotion: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.1 }
  },
  
  // GPU-accelerated properties only
  gpuAccelerated: ['transform', 'opacity', 'filter'],
  
  // Animation settings for different device types
  mobile: {
    duration: 0.2,
    ease: 'easeOut',
    reduce: true
  },
  desktop: {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94],
    reduce: false
  }
} as const

// Custom transition presets
export const transitions = {
  smooth: {
    duration: 0.4,
    ease: [0.25, 0.46, 0.45, 0.94]
  },
  bouncy: {
    ...springs.bouncy,
    duration: 0.6
  },
  snappy: {
    duration: 0.2,
    ease: 'easeOut'
  },
  gentle: {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94]
  }
} as const

// Intersection Observer animation variants
export const scrollAnimations = {
  fadeInUp: {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

// Animation utilities for different content types
export const contentAnimations = {
  hero: {
    initial: { opacity: 0, y: 100, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { 
      duration: 1, 
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.2 
    }
  },
  card: {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    whileHover: { 
      y: -5, 
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' 
    },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  text: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.5 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  image: {
    initial: { opacity: 0, scale: 1.1 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export default {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInFromBottom,
  staggerContainer,
  staggerItem,
  pageTransitions,
  loadingAnimations,
  hoverAnimations,
  springs,
  easings,
  timing,
  transitions,
  scrollAnimations,
  contentAnimations,
  performanceSettings
}