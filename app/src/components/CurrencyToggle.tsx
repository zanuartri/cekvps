import { useCurrency, type CurrencyCode } from '@/context/CurrencyContext'

const CURRENCIES: CurrencyCode[] = ['IDR', 'USD', 'EUR']

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="flex rounded-lg border bg-card p-0.5">
      {CURRENCIES.map(c => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            currency === c
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
