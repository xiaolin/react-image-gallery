import {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  SyntheticEvent,
  TouchEvent,
} from "react";

// ============= Gallery Item Types =============

/**
 * Image set for responsive images
 */
export interface ImageSet {
  srcSet: string;
  media: string;
}

/**
 * Individual gallery item configuration
 */
export interface GalleryItem {
  /** URL of the main image */
  original: string;
  /** URL of the thumbnail image */
  thumbnail?: string;
  /** URL of the fullscreen image (defaults to original) */
  fullscreen?: string;
  /** Original image width for aspect ratio (as string for img attribute) */
  originalWidth?: string;
  /** Original image height for aspect ratio (as string for img attribute) */
  originalHeight?: string;
  /** Thumbnail image width */
  thumbnailWidth?: string | number;
  /** Thumbnail image height */
  thumbnailHeight?: string | number;
  /** Alt text for the main image */
  originalAlt?: string;
  /** Alt text for the thumbnail */
  thumbnailAlt?: string;
  /** Title attribute for the main image */
  originalTitle?: string;
  /** Title attribute for the thumbnail */
  thumbnailTitle?: string;
  /** Description text shown below the image */
  description?: string;
  /** Label shown on the thumbnail */
  thumbnailLabel?: string;
  /** Additional CSS class for the slide */
  originalClass?: string;
  /** Additional CSS class for the thumbnail */
  thumbnailClass?: string;
  /** Additional CSS class for the bullet */
  bulletClass?: string;
  /** Loading strategy for the main image */
  loading?: "eager" | "lazy";
  /** Loading strategy for the thumbnail */
  thumbnailLoading?: "eager" | "lazy";
  /** srcSet for responsive main images */
  srcSet?: string;
  /** sizes attribute for responsive images */
  sizes?: string;
  /** Array of image sets for picture element */
  imageSet?: ImageSet[];
  /** Custom render function for this item */
  renderItem?: (item: GalleryItem) => ReactNode;
  /** Custom render function for this thumbnail */
  renderThumbInner?: (item: GalleryItem) => ReactNode;
  /** Click handler for bullet */
  bulletOnClick?: (event: MouseEvent<HTMLButtonElement>, index: number) => void;
}

// ============= Thumbnail Position =============

export type ThumbnailPosition = "top" | "bottom" | "left" | "right";

// ============= Event Handler Types =============

// SlideEvent can be various event types or undefined (no null since we use optional params)
export type SlideEvent =
  | MouseEvent
  | KeyboardEvent
  | TouchEvent
  | Event
  | SyntheticEvent
  | undefined;

export type OnSlideCallback = (currentIndex: number) => void;
export type OnBeforeSlideCallback = (nextIndex: number) => void;
export type OnScreenChangeCallback = (fullscreen: boolean) => void;
export type OnPauseCallback = (currentIndex: number) => void;
export type OnPlayCallback = (currentIndex: number) => void;
export type OnClickCallback = (
  event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>
) => void;
export type OnImageLoadCallback = (
  event: SyntheticEvent<HTMLImageElement>
) => void;
export type OnImageErrorCallback = (
  event: SyntheticEvent<HTMLImageElement>
) => void;
export type OnTouchCallback = (event: TouchEvent<HTMLDivElement>) => void;
export type OnMouseCallback = (event: MouseEvent<HTMLDivElement>) => void;
export type OnBulletClickCallback = (
  event: MouseEvent<HTMLButtonElement>,
  index: number
) => void;
export type OnThumbnailClickCallback = (
  event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  index: number
) => void;
export type OnThumbnailErrorCallback = (
  event: SyntheticEvent<HTMLImageElement>
) => void;

// ============= Render Function Types =============

export type RenderNavCallback = (
  onClick: (event?: SlideEvent) => void,
  disabled: boolean
) => ReactNode;

export type RenderPlayPauseCallback = (
  onClick: () => void,
  isPlaying: boolean
) => ReactNode;

export type RenderFullscreenCallback = (
  onClick: () => void,
  isFullscreen: boolean
) => ReactNode;

export type RenderItemCallback = (item: GalleryItem) => ReactNode;
export type RenderThumbInnerCallback = (item: GalleryItem) => ReactNode;
export type RenderCustomControlsCallback = () => ReactNode;

// ============= ImageGallery Props =============

export interface ImageGalleryProps {
  /** Array of gallery items to display */
  items: GalleryItem[];
  /** Additional CSS class for the gallery container */
  additionalClass?: string;
  /** Auto-play slideshow on mount */
  autoPlay?: boolean;
  /** Disable keyboard navigation */
  disableKeyDown?: boolean;
  /** Disable swipe gestures on main slides */
  disableSwipe?: boolean;
  /** Disable thumbnail auto-scroll to active thumbnail */
  disableThumbnailScroll?: boolean;
  /** Disable swipe gestures on thumbnails */
  disableThumbnailSwipe?: boolean;
  /** Velocity threshold for flick detection (0-1) */
  flickThreshold?: number;
  /** Separator between current and total in index indicator */
  indexSeparator?: string;
  /** Enable infinite loop sliding */
  infinite?: boolean;
  /** Enable right-to-left layout */
  isRTL?: boolean;
  /** Enable lazy loading of images */
  lazyLoad?: boolean;
  /** Fallback image URL on error */
  onErrorImageURL?: string;
  /** Show bullet navigation */
  showBullets?: boolean;
  /** Show fullscreen toggle button */
  showFullscreenButton?: boolean;
  /** Show current/total index indicator */
  showIndex?: boolean;
  /** Show left/right navigation arrows */
  showNav?: boolean;
  /** Show play/pause button */
  showPlayButton?: boolean;
  /** Show thumbnail strip */
  showThumbnails?: boolean;
  /** Slide animation duration in milliseconds */
  slideDuration?: number;
  /** Auto-play interval in milliseconds */
  slideInterval?: number;
  /** Slide to image on thumbnail hover */
  slideOnThumbnailOver?: boolean;
  /** Enable vertical sliding instead of horizontal */
  slideVertically?: boolean;
  /** Initial slide index */
  startIndex?: number;
  /** Stop event propagation on swipe */
  stopPropagation?: boolean;
  /** Minimum swipe distance to trigger slide change */
  swipeThreshold?: number;
  /** Transition duration during swiping */
  swipingTransitionDuration?: number;
  /** Position of thumbnail strip */
  thumbnailPosition?: ThumbnailPosition;
  /** Use browser fullscreen API vs modal fullscreen */
  useBrowserFullscreen?: boolean;
  /** Use translate3d for GPU acceleration */
  useTranslate3D?: boolean;
  /** Attach keyboard listener to window vs gallery element */
  useWindowKeyDown?: boolean;

  // ============= Event Callbacks =============

  /** Called before slide transition starts */
  onBeforeSlide?: OnBeforeSlideCallback;
  /** Called when a bullet is clicked */
  onBulletClick?: OnBulletClickCallback;
  /** Called when the gallery is clicked */
  onClick?: OnClickCallback;
  /** Called on main image error */
  onImageError?: OnImageErrorCallback;
  /** Called when main image loads */
  onImageLoad?: OnImageLoadCallback;
  /** Called on mouse leave from gallery */
  onMouseLeave?: OnMouseCallback;
  /** Called on mouse over gallery */
  onMouseOver?: OnMouseCallback;
  /** Called when auto-play pauses */
  onPause?: OnPauseCallback;
  /** Called when auto-play starts */
  onPlay?: OnPlayCallback;
  /** Called when fullscreen state changes */
  onScreenChange?: OnScreenChangeCallback;
  /** Called after slide transition completes */
  onSlide?: OnSlideCallback;
  /** Called when a thumbnail is clicked */
  onThumbnailClick?: OnThumbnailClickCallback;
  /** Called on thumbnail image error */
  onThumbnailError?: OnThumbnailErrorCallback;
  /** Called on touch end */
  onTouchEnd?: OnTouchCallback;
  /** Called on touch move */
  onTouchMove?: OnTouchCallback;
  /** Called on touch start */
  onTouchStart?: OnTouchCallback;

  // ============= Render Callbacks =============

  /** Custom renderer for bottom navigation (vertical mode) */
  renderBottomNav?: RenderNavCallback;
  /** Custom renderer for additional controls */
  renderCustomControls?: RenderCustomControlsCallback;
  /** Custom renderer for fullscreen button */
  renderFullscreenButton?: RenderFullscreenCallback;
  /** Custom renderer for slide items */
  renderItem?: RenderItemCallback;
  /** Custom renderer for left navigation */
  renderLeftNav?: RenderNavCallback;
  /** Custom renderer for play/pause button */
  renderPlayPauseButton?: RenderPlayPauseCallback;
  /** Custom renderer for right navigation */
  renderRightNav?: RenderNavCallback;
  /** Custom renderer for thumbnail inner content */
  renderThumbInner?: RenderThumbInnerCallback;
  /** Custom renderer for top navigation (vertical mode) */
  renderTopNav?: RenderNavCallback;
}

// ============= ImageGallery Ref Methods =============

export interface ImageGalleryRef {
  /** Start auto-play */
  play: () => void;
  /** Stop auto-play */
  pause: () => void;
  /** Toggle auto-play */
  togglePlay: () => void;
  /** Enter fullscreen mode */
  fullScreen: () => void;
  /** Exit fullscreen mode */
  exitFullScreen: () => void;
  /** Toggle fullscreen mode */
  toggleFullScreen: () => void;
  /** Navigate to specific slide index */
  slideToIndex: (index: number, event?: SlideEvent) => void;
  /** Get current slide index */
  getCurrentIndex: () => number;
}

// ============= Hook Types =============

export interface UseGalleryNavigationProps {
  items: GalleryItem[];
  startIndex: number;
  infinite: boolean;
  isRTL: boolean;
  slideDuration: number;
  onSlide?: OnSlideCallback | null;
  onBeforeSlide?: OnBeforeSlideCallback | null;
}

export interface UseGalleryNavigationReturn {
  currentIndex: number;
  previousIndex: number;
  isTransitioning: boolean;
  currentSlideOffset: number;
  canSlideLeft: () => boolean;
  canSlideRight: () => boolean;
  slideToIndex: (index: number, event?: SlideEvent) => void;
  slideToIndexCore: (
    index: number,
    event?: SlideEvent,
    isPlayPause?: boolean
  ) => void;
  slideToIndexWithStyleReset: (index: number, event?: SlideEvent) => void;
  slideLeft: (event?: SlideEvent) => void;
  slideRight: (event?: SlideEvent) => void;
  getContainerStyle: (options?: ContainerStyleOptions) => CSSProperties;
  getExtendedSlides: () => ExtendedSlidesResult;
  getAlignmentClass: (displayIndex: number) => string;
  setCurrentSlideOffset: (offset: number) => void;
  setSlideStyle: (style: CSSProperties) => void;
}

export interface ContainerStyleOptions {
  useTranslate3D?: boolean;
  slideVertically?: boolean;
}

export interface ExtendedSlidesResult {
  extendedItems: GalleryItem[];
  getSlideKey: (displayIndex: number) => string;
  getRealIndex: (displayIndex: number) => number;
}

export interface UseThumbnailsProps {
  currentIndex: number;
  items: GalleryItem[];
  thumbnailPosition: ThumbnailPosition;
  disableThumbnailScroll: boolean;
  slideDuration: number;
  isRTL: boolean;
  useTranslate3D: boolean;
}

export interface UseThumbnailsReturn {
  thumbsTranslate: number;
  setThumbsTranslate: (value: number) => void;
  thumbsSwipedTranslate: number;
  setThumbsSwipedTranslate: (value: number) => void;
  setThumbsStyle: (style: CSSProperties) => void;
  thumbnailsWrapperWidth: number;
  thumbnailsWrapperHeight: number;
  isSwipingThumbnail: boolean;
  setIsSwipingThumbnail: (value: boolean) => void;
  thumbnailsWrapperRef: React.RefObject<HTMLDivElement | null>;
  thumbnailsRef: React.RefObject<HTMLDivElement | null>;
  isThumbnailVertical: () => boolean;
  getThumbnailStyle: () => CSSProperties;
  getThumbnailBarHeight: (
    gallerySlideWrapperHeight: number
  ) => number | undefined;
  initResizeObserver: (element: React.RefObject<HTMLElement | null>) => void;
  removeResizeObserver: () => void;
}

export interface UseFullscreenProps {
  useBrowserFullscreen: boolean;
  onScreenChange?: OnScreenChangeCallback | null;
  galleryRef: React.RefObject<HTMLDivElement | null>;
}

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  modalFullscreen: boolean;
  fullScreen: () => void;
  exitFullScreen: () => void;
  toggleFullScreen: () => void;
  handleScreenChange: () => void;
}

export interface UseAutoPlayProps {
  autoPlay: boolean;
  slideInterval: number;
  slideDuration: number;
  infinite: boolean;
  totalSlides: number;
  currentIndex: number;
  canSlideRight: () => boolean;
  slideToIndexCore: (
    index: number,
    event?: SlideEvent,
    isPlayPause?: boolean
  ) => void;
  slideToIndexWithStyleReset: (index: number, event?: SlideEvent) => void;
  onPlay?: OnPlayCallback | null;
  onPause?: OnPauseCallback | null;
}

export interface UseAutoPlayReturn {
  isPlaying: boolean;
  playPauseIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
}

// ============= Component Props =============

export interface SlideProps {
  alignment: string;
  index: number;
  originalClass: string;
  onClick?: OnClickCallback | null;
  onKeyUp?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onMouseLeave?: OnMouseCallback | null;
  onMouseOver?: OnMouseCallback | null;
  onTouchEnd?: OnTouchCallback | null;
  onTouchMove?: OnTouchCallback | null;
  onTouchStart?: OnTouchCallback | null;
  children: ReactNode;
}

export interface ItemProps {
  description?: string;
  fullscreen?: string;
  handleImageLoaded: (
    event: SyntheticEvent<HTMLImageElement>,
    original: string
  ) => void;
  isFullscreen: boolean;
  loading?: "eager" | "lazy";
  original: string;
  originalAlt?: string;
  originalHeight?: number;
  originalTitle?: string;
  originalWidth?: number;
  sizes?: string;
  srcSet?: string;
  onImageError?: OnImageErrorCallback;
}

export interface ThumbnailProps {
  index: number;
  isActive: boolean;
  thumbnailClass: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyUp: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onMouseLeave?: ((event: MouseEvent<HTMLButtonElement>) => void) | null;
  onMouseOver: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}

export interface ThumbnailBarProps {
  disableThumbnailSwipe: boolean;
  isRTL: boolean;
  thumbnailBarHeight?: number;
  thumbnailPosition: ThumbnailPosition;
  thumbnails: ReactNode[];
  thumbnailsRef: React.RefObject<HTMLDivElement | null>;
  thumbnailStyle: CSSProperties;
  thumbnailsWrapperRef: React.RefObject<HTMLDivElement | null>;
  onSwiped: () => void;
  onSwiping: (data: SwipeEventData) => void;
}

export interface BulletProps {
  bulletClass?: string;
  index: number;
  isActive: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface BulletNavProps {
  bullets: ReactNode[];
  slideVertically: boolean;
}

export interface IndexIndicatorProps {
  currentIndex: number;
  indexSeparator: string;
  totalItems: number;
}

export interface NavButtonProps {
  disabled: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface PlayPauseProps {
  isPlaying: boolean;
  onClick: () => void;
}

export interface FullscreenProps {
  isFullscreen: boolean;
  onClick: () => void;
}

export interface SwipeWrapperProps {
  className?: string;
  delta?: number;
  onSwiped: (data: SwipeEventData) => void;
  onSwiping: (data: SwipeEventData) => void;
  children: ReactNode;
}

export interface SwipeEventData {
  event: TouchEvent | MouseEvent;
  absX: number;
  absY: number;
  dir: SwipeDirection;
  velocity: number;
}

export type SwipeDirection = "Left" | "Right" | "Up" | "Down";

// ============= SVG Props =============

export interface SVGProps {
  strokeWidth?: number;
}
