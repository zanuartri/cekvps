import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CurrencyCode } from '@/lib/types'

interface CurrencyCtx {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: 'IDR',
  setCurrency: () => {},
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('IDR')
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
