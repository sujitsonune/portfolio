'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselImage {
  url: string
  caption?: string
  isMain?: boolean
  order?: number
}

interface ImageCarouselProps {
  images: CarouselImage[]
  initialIndex?: number
  onClose?: () => void
  showControls?: boolean
  showThumbnails?: boolean
  allowFullscreen?: boolean
  className?: string
}

export function ImageCarousel({
  images,
  initialIndex = 0,
  onClose,
  showControls = true,
  showThumbnails = true,
  allowFullscreen = true,
  className
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Sort images by order or keep main image first
  const sortedImages = [...images].sort((a, b) => {
    if (a.isMain) return -1
    if (b.isMain) return 1
    return (a.order || 0) - (b.order || 0)
  })

  const currentImage = sortedImages[currentIndex]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          previousImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            onClose?.()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isFullscreen])

  // Touch handling for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      nextImage()
    } else if (distance < -minSwipeDistance) {
      previousImage()
    }
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length)
    setIsLoading(true)
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
    setIsLoading(true)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
    setIsLoading(true)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = currentImage.url
    link.download = `project-image-${currentIndex + 1}`
    link.click()
  }

  if (sortedImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
        <p className="text-secondary-500">No images available</p>
      </div>
    )
  }

  const CarouselContent = (
    <div 
      className={cn(
        'relative bg-black/90 rounded-lg overflow-hidden',
        isFullscreen ? 'fixed inset-0 z-[60] rounded-none' : '',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      {(onClose || isFullscreen) && (
        <button
          onClick={() => isFullscreen ? setIsFullscreen(false) : onClose?.()}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Main image container */}
      <div className={cn(
        'relative',
        isFullscreen ? 'h-screen' : 'h-64 md:h-96'
      )}>
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary-200 dark:bg-secondary-800 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
          </div>
        )}

        {/* Main image */}
        <Image
          src={currentImage.url}
          alt={currentImage.caption || `Project image ${currentIndex + 1}`}
          fill
          className={cn(
            'object-contain transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          priority={currentIndex === 0}
        />

        {/* Image counter */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {sortedImages.length}
        </div>

        {/* Action buttons */}
        <div className="absolute top-4 right-16 flex gap-2">
          {allowFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Toggle fullscreen"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={downloadImage}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Download image"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation arrows */}
        {showControls && sortedImages.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Caption */}
        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
            <p className="text-white text-center">{currentImage.caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && sortedImages.length > 1 && !isFullscreen && (
        <div className="p-4 bg-black/20">
          <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide">
            {sortedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all duration-200',
                  currentIndex === index 
                    ? 'ring-2 ring-primary-500 opacity-100' 
                    : 'opacity-60 hover:opacity-80'
                )}
              >
                <Image
                  src={image.url}
                  alt={image.caption || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dots indicator for mobile */}
      {sortedImages.length > 1 && (isFullscreen || window.innerWidth < 768) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {sortedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                currentIndex === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  return CarouselContent
}

// Lightbox component for standalone use
interface LightboxProps {
  images: CarouselImage[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

export function Lightbox({ images, isOpen, onClose, initialIndex = 0 }: LightboxProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl">
        <ImageCarousel
          images={images}
          initialIndex={initialIndex}
          onClose={onClose}
          allowFullscreen={false}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

// Simple image gallery component
interface ImageGalleryProps {
  images: CarouselImage[]
  columns?: 2 | 3 | 4
  className?: string
  onImageClick?: (index: number) => void
}

export function ImageGallery({ 
  images, 
  columns = 3, 
  className,
  onImageClick 
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const handleImageClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index)
    } else {
      setLightboxIndex(index)
      setLightboxOpen(true)
    }
  }

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4'
  }

  return (
    <>
      <div className={cn('grid gap-4', gridClasses[columns], className)}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(index)}
            className="relative aspect-video rounded-lg overflow-hidden group hover-lift"
          >
            <Image
              src={image.url}
              alt={image.caption || `Gallery image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            
            {/* Zoom icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="p-2 bg-white/90 rounded-full">
                <ZoomIn className="h-5 w-5 text-gray-800" />
              </div>
            </div>

            {/* Caption */}
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm truncate">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <Lightbox
        images={images}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </>
  )
}