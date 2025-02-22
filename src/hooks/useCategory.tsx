import { useSearchParams } from 'next/navigation'

const useCategory = () => {
  const searchParams = useSearchParams()
  const category = searchParams.get('categories') || ''
  return category
}

export default useCategory
