"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
// Remove ArrowLeft and ArrowRight from the import
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  showIndicators?: boolean
  fullWidthSlides?: boolean
  navButtonStyle?: 'inside' | 'outside'
  indicatorStyle?: 'standard' | 'centered' | 'line'
  showPartialSlides?: boolean
}

// Update the CarouselContextProps type to include visibleSlides
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex?: number
  visibleSlides: number
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const CarouselIndicators = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { api, indicatorStyle, visibleSlides } = useCarousel()
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    api.on('select', () => {
      setSelectedIndex(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = React.useCallback((index: number) => {
    api?.scrollTo(index)
  }, [api])

  if (!api) return null
  
  // Calculate how many page indicators we need based on visible slides
  const totalSlides = api.slideNodes().length;
  const pageCount = Math.ceil(totalSlides / visibleSlides);
  
  // Create an array of page indices
  const pageIndices = Array.from({ length: pageCount }, (_, i) => 
    i * visibleSlides
  );
  
  // Determine which page is active
  const activePage = Math.floor(selectedIndex / visibleSlides);

  // Render indicators based on pages instead of individual slides
  if (indicatorStyle === 'line') {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 items-center",
          className
        )}
        {...props}
      >
        {pageIndices.map((pageStartIndex, pageIndex) => {
          const isActive = pageIndex === activePage;
          
          return (
            <button
              key={pageIndex}
              className={cn(
                "h-1 w-6 transition-all duration-300",
                isActive 
                  ? "bg-primary" 
                  : "bg-slate-300/60"
              )}
              onClick={() => scrollTo(pageStartIndex)}
              aria-label={`Go to page ${pageIndex + 1}`}
            />
          );
        })}
      </div>
    );
  }
  
  if (indicatorStyle === 'centered') {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 items-center",
          className
        )}
        {...props}
      >
        {[...Array(api.scrollSnapList().length)].map((_, index) => {
          const isActive = index === selectedIndex;
          const isAdjacent = Math.abs(index - selectedIndex) === 1;
          
          return (
            <button
              key={index}
              className={cn(
                "rounded-full transition-all duration-300",
                isActive 
                  ? "bg-primary size-4 shadow-md transform scale-110" 
                  : isAdjacent
                    ? "bg-slate-300/80 size-3 transform scale-90"
                    : "bg-slate-300/60 size-2"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 items-end",
        className
      )}
      {...props}
    >
      {[...Array(api.scrollSnapList().length)].map((_, index) => (
        <button
          key={index}
          className={cn(
            "rounded-full transition-colors",
            index === selectedIndex 
              ? "bg-primary size-3" 
              : "bg-slate-300 h-2 w-2"
          )}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  )
})
CarouselIndicators.displayName = "CarouselIndicators"

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      showIndicators = true,
      navButtonStyle = 'outside',
      indicatorStyle = 'standard',
      showPartialSlides = false,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [visibleSlides, setVisibleSlides] = React.useState(1)

    // Calculate visible slides based on container width and slide width
    React.useEffect(() => {
      if (!api) return;
      
      const calculateVisibleSlides = () => {
        const containerWidth = api.containerNode().getBoundingClientRect().width;
        const slideWidth = api.slideNodes()[0]?.getBoundingClientRect().width || 0;
        
        if (slideWidth === 0) return 1;
        
        // Calculate how many slides fit in the container
        const visibleCount = Math.floor(containerWidth / slideWidth);
        setVisibleSlides(Math.max(1, visibleCount));
      };
      
      // Calculate on init and resize
      calculateVisibleSlides();
      window.addEventListener('resize', calculateVisibleSlides);
      
      return () => {
        window.removeEventListener('resize', calculateVisibleSlides);
      };
    }, [api]);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      setSelectedIndex(api.selectedScrollSnap())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          showIndicators,
          navButtonStyle,
          indicatorStyle,
          showPartialSlides,
          selectedIndex,
          visibleSlides, // Add the visibleSlides to the context
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
          {showIndicators && <CarouselIndicators />}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel" 

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation, showPartialSlides } = useCarousel()

  return (
    <div 
      ref={carouselRef} 
      className={cn(
        "overflow-hidden",
        showPartialSlides && "px-4"
      )}
    >
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-0" : "-mt-0 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent" // Add display name

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, forwardedRef) => {
  const { orientation, showPartialSlides, selectedIndex } = useCarousel()
  const [index, setIndex] = React.useState<number | null>(null)
  const itemRef = React.useRef<HTMLDivElement>(null);
  
  // Combine refs
  React.useImperativeHandle(forwardedRef, () => itemRef.current as HTMLDivElement);
  
  // Determine if this slide is the active one
  React.useEffect(() => {
    if (!showPartialSlides || !itemRef.current) return
    
    // We need to find the index of this slide among its siblings
    const parent = itemRef.current.parentElement
    if (!parent) return
    
    const children = Array.from(parent.children)
    const thisIndex = children.indexOf(itemRef.current)
    setIndex(thisIndex)
  }, [showPartialSlides])
  
  // Check if this is the active slide
  const isActive = index !== null && index === selectedIndex
  
  return (
    <div
      ref={itemRef}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0",
        showPartialSlides ? "basis-[85%] md:basis-[90%] transition-all duration-300 px-2" : "basis-full",
        orientation === "horizontal" ? "pl-0" : "pt-0",
        showPartialSlides && isActive && "z-10",
        className
      )}
      style={{
        ...(showPartialSlides && {
          transform: isActive ? "scale(1.05)" : "scale(1)",
          transition: "transform 300ms ease, box-shadow 300ms ease",
          boxShadow: isActive ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" : "none"
        })
      }}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem" 

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev, navButtonStyle } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? navButtonStyle === 'outside' 
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "left-4 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious" 

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext, navButtonStyle } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? navButtonStyle === 'outside' 
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "right-4 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext" 

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
}
