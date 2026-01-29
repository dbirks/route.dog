import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddressSuggestion {
  display_name: string
  lat: string
  lon: string
  address?: {
    road?: string
    city?: string
    state?: string
    postcode?: string
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: { address: string; lat: number; lon: number }) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  onSubmit,
  disabled,
  placeholder = "Enter address..."
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const timeoutRef = useRef<number | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced geocoding search using Nominatim (OpenStreetMap)
  useEffect(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current)
    }

    if (value.length < 3) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&addressdetails=1&limit=5&q=${encodeURIComponent(value)}`,
          {
            headers: {
              'User-Agent': 'RouteDog/1.0'
            }
          }
        )
        const data = await response.json()
        setSuggestions(data)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Geocoding error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 500) // 500ms debounce

    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value])

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name)
    onSelect({
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    })
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        } else {
          onSubmit()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9 pr-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-start gap-2",
                  selectedIndex === index && "bg-accent"
                )}
              >
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    {suggestion.address?.road && suggestion.address.road}
                    {!suggestion.address?.road && suggestion.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.address?.road
                      ? `${suggestion.address.city || ''}, ${suggestion.address.state || ''} ${suggestion.address.postcode || ''}`.trim()
                      : suggestion.display_name
                    }
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-t">
            Use ↑↓ to navigate, Enter to select
          </div>
        </div>
      )}
    </div>
  )
}
