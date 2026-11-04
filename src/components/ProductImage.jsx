import { useState } from 'react'

const FALLBACK_IMAGE = '/images/fallback.jpg'

export default function ProductImage({
  src,
  alt,
  className,
  loading = 'lazy',
  width = 640,
  height = 480,
  fetchPriority = loading === 'eager' ? 'high' : 'auto',
}) {
  const [failedSource, setFailedSource] = useState('')
  const [fallbackErrorFor, setFallbackErrorFor] = useState('')
  const source = src || FALLBACK_IMAGE
  const imageSource = failedSource === source ? FALLBACK_IMAGE : source

  if (fallbackErrorFor === source) return null

  return (
    <img
      src={imageSource}
      alt={alt || 'Grocery product'}
      loading={loading}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      className={className}
      onError={() => {
        if (imageSource === FALLBACK_IMAGE) {
          setFallbackErrorFor(source)
        } else {
          setFailedSource(source)
        }
      }}
    />
  )
}
