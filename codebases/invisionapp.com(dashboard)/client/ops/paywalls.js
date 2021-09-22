import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import * as helios from '@invisionapp/helios'
import * as sc from 'styled-components'
import { loadRemoteComponent } from '@invisionapp/remote-component-loader'
import useSubFeature from '@invisionapp/runtime-provided-resources/use-sub-feature'

let paywall
const useLoadBanners = () => {
  const { subFeature, loading } = useSubFeature({
    subFeatureName: 'global-banner'
  })

  return [subFeature, loading]
}

let paywallPromise
export const useLoadPaywalls = () => {
  const [subFeature, loading] = useLoadBanners()
  const [isPaywallLoading, setPaywallLoading] = useState(true)

  useEffect(() => {
    if (!loading && subFeature) {
      setPaywallLoading(false)
    }
  }, [loading, subFeature])

  const loadPaywalls = () => {
    if (!paywall) {
      const PAYWALL_PEER_DEPENDENCIES_MAPPING = {
        react: React,
        'react-dom': ReactDOM,
        '@invisionapp/helios': helios,
        '@invisionapp/global-banner/dist': subFeature,
        'styled-components': sc
      }

      if (paywallPromise) {
        return paywallPromise
      }

      paywallPromise = loadRemoteComponent({
        componentName: 'paywall-library-static',
        bundleExportName: 'Paywall',
        manifestKey: 'namedCriticalPathFiles',
        namedFileKey: 'mainJSBundle',
        peerDependenciesMapping: PAYWALL_PEER_DEPENDENCIES_MAPPING
      }).then(response => {
        paywall = response
        return Promise.resolve(paywall)
      })

      return paywallPromise
    }

    return Promise.resolve(paywall)
  }

  return [isPaywallLoading, loadPaywalls]
}
