import React from 'react'

import ConfigurationAliasGrid from './ConfigurationAliasGrid'
import ConfigurationRawData from './ConfigurationRawData'
import ConfigurationRuleGrid from './ConfigurationRuleGrid'

export default function RecordConfigurationTabs() {
  return (
    <>
      <ConfigurationRawData />
      <span>Rule</span>
      <ConfigurationRuleGrid />
      <span>Alias</span>
      <ConfigurationAliasGrid />
    </>
  )
}
