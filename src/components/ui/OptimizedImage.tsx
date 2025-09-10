'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  loading?: 'lazy' | 'eager'
  unoptimized?: boolean
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  showLoadingPlaceholder?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  unoptimized = false,
  onLoad,
  onError,
  fallbackSrc,
  showLoadingPlaceholder = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imageRef = useRef<HTMLImageElement>(null)

  // Generate blur placeholder for better UX
  const generateBlurDataURL = (width: number = 10, height: number = 10) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, width, height)
    }
    return canvas.toDataURL()
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
    }
    
    onError?.()
  }

  // Responsive sizes for different breakpoints
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  // Error state
  if (hasError && (!fallbackSrc || currentSrc === fallbackSrc)) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-secondary-100 dark:bg-secondary-800 text-secondary-400 dark:text-secondary-500',
          !fill && width && height ? '' : 'w-full h-full',
          className
        )}
        style={!fill && width && height ? { width, height } : {}}
      >
        <div className="text-center">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Image failed to load</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Loading placeholder */}
      {isLoading && showLoadingPlaceholder && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center bg-secondary-100 dark:bg-secondary-800',
            !fill && 'rounded-inherit'
          )}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-secondary-500 dark:text-secondary-400">Loading...</p>
          </div>
        </motion.div>
      )}

      <Image
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || (placeholder === 'blur' ? generateBlurDataURL() : undefined)}
        sizes={defaultSizes}
        style={{
          objectFit,
          objectPosition,
        }}
        loading={loading}
        unoptimized={unoptimized}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100'
        )}
        {...props}
      />
    </div>
  )
}

// Specialized components for different use cases
interface AvatarImageProps extends Omit<OptimizedImageProps, 'width' | 'height' | 'fill' | 'objectFit'> {
  size?: number
}

export function AvatarImage({ size = 40, className, ...props }: AvatarImageProps) {
  return (
    <OptimizedImage
      width={size}
      height={size}
      objectFit="cover"
      className={cn('rounded-full', className)}
      placeholder="blur"
      quality={90}
      {...props}
    />
  )
}

interface HeroImageProps extends Omit<OptimizedImageProps, 'priority' | 'sizes'> {
  variant?: 'hero' | 'banner' | 'cover'
}

export function HeroImage({ variant = 'hero', className, ...props }: HeroImageProps) {
  const sizes = {
    hero: '100vw',
    banner: '(max-width: 768px) 100vw, 100vw',
    cover: '(max-width: 768px) 100vw, 75vw'
  }

  return (
    <OptimizedImage
      priority={true}
      sizes={sizes[variant]}
      quality={90}
      placeholder="blur"
      className={cn('w-full', className)}
      {...props}
    />
  )
}

interface ProjectImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  variant?: 'thumbnail' | 'gallery' | 'detail'
}

export function ProjectImage({ variant = 'thumbnail', className, ...props }: ProjectImageProps) {
  const sizes = {
    thumbnail: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    gallery: '(max-width: 768px) 100vw, 50vw',
    detail: '100vw'
  }

  return (
    <OptimizedImage
      sizes={sizes[variant]}
      quality={variant === 'detail' ? 95 : 85}
      placeholder="blur"
      className={cn(
        'rounded-lg',
        variant === 'thumbnail' && 'aspect-video',
        className
      )}
      {...props}
    />
  )
}

// Image gallery component with lazy loading
interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  className?: string
  itemClassName?: string
}

export function ImageGallery({ images, className, itemClassName }: ImageGalleryProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {images.map((image, index) => (
        <motion.div
          key={image.src}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={cn('group', itemClassName)}
        >
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <ProjectImage
              src={image.src}
              alt={image.alt}
              fill={true}
              variant="gallery"
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {image.caption && (
            <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-2">
              {image.caption}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default OptimizedImage