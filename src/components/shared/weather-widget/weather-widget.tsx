import { Badge } from '@/components/shadcn/badge'
import { Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'
  location: string
}

interface WeatherWidgetProps {
  weatherData?: WeatherData
  className?: string
  compact?: boolean
}

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny':
      return <Sun className="h-5 w-5 text-yellow-500" />
    case 'cloudy':
      return <Cloud className="h-5 w-5 text-gray-500" />
    case 'rainy':
      return <CloudRain className="h-5 w-5 text-blue-500" />
    case 'snowy':
      return <CloudSnow className="h-5 w-5 text-blue-300" />
    case 'windy':
      return <Wind className="h-5 w-5 text-gray-400" />
    default:
      return <Sun className="h-5 w-5 text-yellow-500" />
  }
}

const getConditionLabel = (condition: string) => {
  switch (condition) {
    case 'sunny':
      return 'Sunny'
    case 'cloudy':
      return 'Cloudy'
    case 'rainy':
      return 'Rainy'
    case 'snowy':
      return 'Snowy'
    case 'windy':
      return 'Windy'
    default:
      return 'Clear'
  }
}

const WeatherWidget = ({ weatherData, className = '', compact = false }: WeatherWidgetProps) => {
  const defaultWeather: WeatherData = {
    temperature: 22,
    condition: 'sunny',
    location: 'Tokyo'
  }

  const data = weatherData || defaultWeather

  if (compact) {
    return (
      <div className={`${className} space-y-2`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Weather</span>
          <Badge variant="secondary" className="text-xs">
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          {getWeatherIcon(data.condition)}
          <div>
            <div className="text-lg font-bold">{data.temperature}°C</div>
            <div className="text-xs text-muted-foreground">
              {getConditionLabel(data.condition)}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          📍 {data.location}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} space-y-4`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Today&apos;s Weather</span>
        <Badge variant="secondary" className="text-xs">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Badge>
      </div>
      
      <div className="text-xs text-muted-foreground">
        📍 {data.location}
      </div>

      <div className="flex items-center space-x-4">
        {getWeatherIcon(data.condition)}
        <div>
          <div className="text-2xl font-bold">{data.temperature}°C</div>
          <div className="text-sm text-muted-foreground">
            {getConditionLabel(data.condition)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget 