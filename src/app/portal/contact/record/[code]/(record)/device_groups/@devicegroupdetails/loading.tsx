import { Loader } from '~/components/ui/loader'

export default function Loading () {
  return (
   <div className='w-full flex items-center justify-center h-full min-h-[calc(100dvh-150px)]'>
         <Loader
            className="bg-primary text-primary"
            label="Fetching data..."
            size="lg"
            variant='spinner'
          />
   </div>
  )
}
