// TypeScript Version: 2.3

import { Component } from 'react'

interface ImageGalleryItem {
    original: string
    thumbnail?: string
    originalClass?: string
    thumbnailClass?: string
    renderItem?(item: ImageGalleryItem): JSX.Element
    renderThumbInner?(item: ImageGalleryItem): JSX.Element
    originalAlt?: string
    thumbnailAlt?: string
    originalTitle?: string
    thumbnailTitle?: string
    thumbnailLabel?: string
    description?: string
    srcSet?: string
    sizes?: string
}

interface ImageGalleryProps {
    items: ImageGalleryItem[]
    flickThreshold?: number
    showNav?: boolean
    autoPlay?: boolean
    lazyLoad?: boolean
    infinite?: boolean
    showIndex?: boolean
    showBullets?: boolean
    showThumbnails?: boolean
    showPlayButton?: boolean
    showFullscreenButton?: boolean
    slideOnThumbnailHover?: boolean
    disableThumbnailScroll?: boolean
    disableArrowKeys?: boolean
    disableSwipe?: boolean
    useBrowserFullscreen?: boolean
    preventDefaultTouchmoveEvent?: boolean
    defaultImage?: string
    indexSeparator?: string
    thumbnailPosition?: string
    startIndex?: number
    slideDuration?: number
    slideInterval?: number
    swipeThreshold?: number
    swipingTransitionDuration?: number
    onSlide?(index: number): void
    onScreenChange?(state: boolean): void
    onPause?(index: number): void
    onPlay?(index: number): void
    onClick?(event: MouseEvent): void
    onImageLoad?(event: UIEvent): void
    onImageError?(event: UIEvent): void
    onTouchMove?(event: TouchEvent): void
    onTouchEnd?(event: TouchEvent): void
    onTouchStart?(event: TouchEvent): void
    onMouseOver?(event: MouseEvent): void
    onMouseLeave?(event: MouseEvent): void
    onThumbnailError?(event: UIEvent): void
    onThumbnailClick?(event: UIEvent, index: number): void
    renderCustomControls?(): JSX.Element
    renderLeftNav?(onClick: (event: MouseEvent) => void, disabled: boolean): JSX.Element
    renderRightNav?(onClick: (event: MouseEvent) => void, disabled: boolean): JSX.Element
    renderPlayPauseButton?(onClick: (event: MouseEvent) => void, isPlaying: boolean): JSX.Element
    renderFullscreenButton?(onClick: (event: MouseEvent) => void, isFullscreen: boolean): JSX.Element
    renderItem?(item: ImageGalleryItem): JSX.Element
    stopPropagation?: boolean
}

export default class ImageGallery extends Component<ImageGalleryProps> {
}
