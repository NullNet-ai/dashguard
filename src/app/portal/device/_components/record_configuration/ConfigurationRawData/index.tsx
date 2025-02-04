'use client'
import hljs from 'highlight.js'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import 'highlight.js/styles/atom-one-light.css'

import { api } from '~/trpc/react'

const HighlightXML = () => {
  const pathName = usePathname()
  const [, , , , identifier] = pathName.split('/')
  const { data: xml } = api.deviceConfiguration.fetchDeviceRawData.useQuery({
    code: identifier!,
  })

  useEffect(() => {
    hljs.highlightAll()
  }, [])

  return (
    <div>
      <pre>
        <code className="xml">{xml}</code>
      </pre>
    </div>
  )
}

export default HighlightXML
