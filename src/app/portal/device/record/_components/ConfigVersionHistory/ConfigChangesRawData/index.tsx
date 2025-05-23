'use client'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js'
import React, { useEffect, useRef } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

import styles from './CodeBlock.module.css'

const CodeBlock = ({
  code,
  backgroundColor = '#f5faf9',
  textColor = '#333',
}: {
  code: string
  language: string
  backgroundColor?: string
  textColor?: string
}) => {
  const codeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (codeRef.current) {
      // Highlight only neutral lines
      const neutralLines = codeRef.current.querySelectorAll('.neutralLine code')
      neutralLines.forEach(line => hljs.highlightElement(line as HTMLElement))
    }
  }, [code])

  const formatCode = (code: string) => {
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
        const escapedLine = escapeXml(line.trim())
        if (escapedLine.startsWith('+')) {
          return `<div class="${styles.addedLine}"><span class="${styles.sign}">+</span><span class="${styles.lineMarker}">${escapedLine.slice(
            1
          )}</span></div>`
        }
        else if (escapedLine.startsWith('-')) {
          return `<div class="${styles.removedLine}"><span class="${styles.sign}">-</span><span class="${styles.lineMarker}">${escapedLine.slice(
            1
          )}</span></div>`
        }
        return `<div class="${styles.neutralLine}"><code>${escapedLine}</code></div>`
      })
      .join('')
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: formatCode(code) }}
      ref={codeRef}
      style={{
        backgroundColor,
        color: textColor,
        padding: '1rem',
        borderRadius: '8px',
        overflow: 'auto',
        paddingRight: '1rem',

      }}
    />
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
    <Card className="border-none p-0 shadow-none">
      <CardHeader>
        <CardTitle>Raw Data</CardTitle>
      </CardHeader>
      {xmlCode.map((code, index) => (
        <CardContent className="mt-2" key={index}>
          <CodeBlock code={code} language="html" />
        </CardContent>
      ))}
    </Card>
  )
}

export default RawData
