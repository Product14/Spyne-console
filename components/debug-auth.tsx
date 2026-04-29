"use client"

import { useEffect, useState } from 'react'

export function DebugAuth() {
  const [authStatus, setAuthStatus] = useState<{
    hasToken: boolean
    tokenPreview: string
    urlParams: string
  }>({
    hasToken: false,
    tokenPreview: '',
    urlParams: ''
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get('auth_key') || urlParams.get('bearerToken') || urlParams.get('token')
      const storedToken = localStorage.getItem('ic_token')
      
      setAuthStatus({
        hasToken: !!(tokenFromUrl || storedToken),
        tokenPreview: (tokenFromUrl || storedToken || '').substring(0, 20) + '...',
        urlParams: window.location.search
      })
    }
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>URL: {authStatus.urlParams}</div>
      <div>Has Token: {authStatus.hasToken ? 'Yes' : 'No'}</div>
      <div>Token: {authStatus.tokenPreview}</div>
    </div>
  )
}

