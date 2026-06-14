import { useCurrency, type CurrencyCode } from '@/context/CurrencyContext'
import { Button } from '@/components/ui/button'

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: 'IDR', label: 'IDR' },
  { code: 'USD', label: 'USD' },
  { code: 'EUR', label: 'EUR' },
]

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="flex gap-1 rounded-lg bg-muted p-0.5">
      {CURRENCIES.map(c => (
        <Button
          key={c.code}
          variant={currency === c.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrency(c.code)}
          className={`px-3 h-8 text-xs font-semibold ${
            currency === c.code ? '' : 'text-muted-foreground'
          }`}
        >
          {c.label}
        </Button>
      ))}
    </div>
  )
}
