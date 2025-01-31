'use client'

import 'highlight.js/styles/default.css'
import hljs from 'highlight.js'
import React, { useEffect, useRef } from 'react'

import {
  Card,
  CardContent,
} from '~/components/ui/card'

const CodeBlock = ({
  code,
  language,
  backgroundColor = '#f5f5f5',
  textColor = '#333',
}: {
  code: string
  language: string
  backgroundColor?: string
  textColor?: string
}) => {
  const codeRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current)
    }
  }, [code])

  const formatCode = (code: string) => {
    // Escape XML entities to prevent rendering issues
    const escapeXml = (str: string) => {
      return str.replace(/[&<>"']/g, (char) => {
        switch (char) {
          case '&':
            return '&amp;'
          case '<':
            return '&lt;'
          case '>':
            return '&gt;'
          case '"':
            return '&quot;'
          case '\'':
            return '&#39;'
          default:
            return char
        }
      })
    }

    return code
      .split('\n')
      .map((line) => {
        // Escape each line to handle XML symbols properly
        const escapedLine = escapeXml(line)
        if (escapedLine.includes('+')) {
          return `<span class="added-line">${escapedLine}</span>`
        }
        else if (escapedLine.includes('-')) {
          return `<span class="removed-line">${escapedLine}</span>`
        }
        return `<span>${escapedLine}</span>`
      })
      .join('\n')
  }

  return (
    <pre
      style={{
        backgroundColor,
        color: textColor,
        padding: '1rem',
        borderRadius: '8px',
        overflow: 'auto',
      }}
    >
      <code
        className={language}
        dangerouslySetInnerHTML={{ __html: formatCode(code) }}
        ref={codeRef}
      />
    </pre>
  )
}

const RawData = () => {
  const xmlCode = [
    `
      <Revision>
        + <Time>1738217208671</Time>
        - <Time>1738217208679</Time>
      </Revision>
    `,
    `
      <Revision>
        + <Time>1738217208677</Time>
        - <Time>1738217208678</Time>
      </Revision>
    `,
  ]

  useEffect(() => {
    hljs.highlightAll()
  }, [])

  return (
    <div>
      <span>Raw Data</span>
      {xmlCode.map((code, index) => (
        <Card className="border-none p-0 shadow-none" key={index}>
          <CardContent className="mt-2">
            <CodeBlock code={code} language="xml" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
export default RawData
