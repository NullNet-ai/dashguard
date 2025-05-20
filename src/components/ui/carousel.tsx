"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

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

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
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
  const { api, indicatorStyle } = useCarousel()
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
        {[...Array(api.scrollSnapList().length)].map((_, index) => {
          const isActive = index === selectedIndex;
          
          return (
            <button
              key={index}
              className={cn(
                "h-1 w-6 transition-all duration-300",
                isActive 
                  ? "bg-primary" 
                  : "bg-slate-300/60"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
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

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
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
>(({ className, ...props }, ref) => {
  const { orientation, showPartialSlides } = useCarousel()
  
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0",
        showPartialSlides ? "basis-[85%] md:basis-[90%] px-2" : "basis-full",
        showPartialSlides && "transition-opacity duration-300", // Only transition opacity, not layout
        orientation === "horizontal" ? "pl-0" : "pt-0",
        className
      )}
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
        "absolute h-8 w-8 rounded-full !flex items-center justify-center",
        orientation === "horizontal"
          ? navButtonStyle === 'outside' 
            ? "-left-12 top-1/2 -translate-y-1/2 md:block hidden"
            : "left-2 top-1/2 -translate-y-1/2 z-10"
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
        "absolute h-8 w-8 rounded-full !flex items-center justify-center",
        orientation === "horizontal"
          ? navButtonStyle === 'outside' 
            ? "-right-12 top-1/2 -translate-y-1/2 md:block hidden"
            : "right-2 top-1/2 -translate-y-1/2 z-10"
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
