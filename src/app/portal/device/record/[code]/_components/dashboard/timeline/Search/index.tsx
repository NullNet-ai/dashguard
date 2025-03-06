import React from 'react'

import SearchProvider from './SearchProvider'
import SearchView from './SearchView'

function Search() {
  return (
    <div>
      <SearchProvider>
        <SearchView />
      </SearchProvider>
    </div>
  )
}

export default Search
