/* eslint-disable react/destructuring-assignment */
import React from 'react'

const WizardLayout: React.FC<any> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { params, children, ...rest } = props

  return <div className="space-y-2">{Object.values(rest)}</div>
}

export const dynamic = 'force-dynamic'

export default WizardLayout
