/** @format */
"use client"
import React, { useEffect, useState, useMemo, useCallback } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js"
import zoomPlugin from "chartjs-plugin-zoom"
import annotationPlugin from "chartjs-plugin-annotation"
import axios, { AxiosError } from "axios"
import { Skeleton } from "@/Components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Button } from "@/Components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Investment } from "./investment"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  zoomPlugin,
  annotationPlugin
)

interface YahooChartResponse {
  chart: {
    result: {
      meta: {
        currency: string
        symbol: string
        exchangeName: string
        fullExchangeName: string
        instrumentType: string
        regularMarketPrice: number
        regularMarketTime: number
        chartPreviousClose: number
        previousClose: number
        shortName: string
      }
      timestamp: number[]
      indicators: {
        quote: {
          low: number[]
          high: number[]
          close: number[]
          open: number[]
          volume: number[]
        }[]
      }
    }[]
    error: null
  }
}

const COLOR_PALETTE = [
  "#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", 
  "#c45850", "#4dc9f6", "#f67019", "#f53794",
  "#537bc4", "#acc236", "#166a8f", "#00a950",
  "#58595b", "#8549ba"
] as const

const RANGE_OPTIONS = [
  { value: '1d', label: '1 Day' },
  { value: '5d', label: '5 Days' },
  { value: '1mo', label: '1 Month' },
  { value: '3mo', label: '3 Months' },
  { value: '6mo', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: '2y', label: '2 Years' },
  { value: '5y', label: '5 Years' },
  { value: '10y', label: '10 Years' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'max', label: 'Max' },
] as const

const INTERVAL_OPTIONS = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '1d', label: '1 Day' },
  { value: '1wk', label: '1 Week' },
  { value: '1mo', label: '1 Month' },
] as const

interface PerformanceChartProps {
  investments: Investment[]
}

// Cache implementation
const chartDataCache = new Map<string, {
  data: YahooChartResponse
  timestamp: number
}>()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache

const PerformanceChart: React.FC<PerformanceChartProps> = ({ investments = [] }) => {
  const [chartData, setChartData] = useState<YahooChartResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<string>('1mo')
  const [interval, setInterval] = useState<string>('1d')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [fetchingStatus, setFetchingStatus] = useState<Record<string, boolean>>({})
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0)

  // API Keys configuration
  const API_KEYS = useMemo(() => [
    process.env.NEXT_PUBLIC_RAPIDAPI1,
    process.env.NEXT_PUBLIC_RAPIDAPI2,
    process.env.NEXT_PUBLIC_RAPIDAPI3,
  ].filter(Boolean) as string[], [])

  const getApiConfig = useCallback((apiKey: string) => ({
    method: "GET",
    baseURL: "https://yahoo-finance166.p.rapidapi.com/api/stock/get-chart",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "yahoo-finance166.p.rapidapi.com",
    },
   
  }), [])

  // Enhanced fetch function with retry and key rotation
  const fetchStockChartData = useCallback(async (symbol: string) => {
    const cacheKey = `${symbol}-${range}-${interval}`
    const cachedData = chartDataCache.get(cacheKey)
    
    // Return cached data if valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.data
    }

    let attempts = 0
    let lastError: Error | null = null
    let apiKeyIndex = currentApiKeyIndex

    while (attempts < API_KEYS.length * 2) { // Try each key twice
      const apiKey = API_KEYS[apiKeyIndex]
      setFetchingStatus(prev => ({ ...prev, [symbol]: true }))

      try {
        const response = await axios({
          ...getApiConfig(apiKey),
          params: {
            region: symbol.includes(".NS") ? "US" : "US",
            symbol,
            range,
            interval,
          }
        })

        if (!response.data?.chart?.result?.[0]) {
          // throw new Error(`Invalid data structure for ${symbol}`)
        }

        // Update cache
        chartDataCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })

        // Update current API key index if successful
        setCurrentApiKeyIndex(apiKeyIndex)
        
        return response.data
      } catch (err) {
        lastError = err as Error
        
        // Rotate API key on failure
        apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.length
        attempts++
        
        // Add delay between retries
        if (attempts < API_KEYS.length * 2) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } finally {
        setFetchingStatus(prev => ({ ...prev, [symbol]: false }))
      }
    }

    throw lastError || new Error(`Failed to fetch data for ${symbol} after ${attempts} attempts`)
  }, [API_KEYS, currentApiKeyIndex, getApiConfig, range, interval])

  // Fetch all investment data with error handling
  const fetchAllData = useCallback(async () => {
    if (investments.length === 0) return

    try {
      setLoading(true)
      setError(null)

      const results = await Promise.allSettled(
        investments.map(inv => fetchStockChartData(inv.symbol)))
      
      const successfulData: YahooChartResponse[] = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulData.push(result.value)
        } else {
          const symbol = investments[index]?.symbol || 'Unknown'
          errors.push(`${symbol}: ${result.reason.message}`)
          console.error(`Failed to fetch ${symbol}:`, result.reason)
        }
      })

      if (successfulData.length === 0) {
        // throw new Error('No data could be loaded. ' + errors.join('; '))
      }

      setChartData(successfulData)
      setLastRefresh(new Date())
      
      if (errors.length > 0) {
        toast.warning(`Partial data loaded. ${errors.length} investments failed.`)
      } else {
        toast.success("Chart data updated")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [investments, fetchStockChartData])

  // Initial data fetch and refresh on range/interval change
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Date formatting based on range
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000)
    switch (range) {
      case '1d': return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case '5d':
      case '1mo': return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      case '3mo':
      case '6mo': return date.toLocaleDateString([], { month: 'short' })
      default: return date.toLocaleDateString([], { year: 'numeric', month: 'short' })
    }
  }, [range])

  // Prepare chart data
  const chartDataConfig = useMemo(() => {
    if (chartData.length === 0) return { labels: [], datasets: [] }

    const referenceTimestamps = chartData[0]?.chart?.result?.[0]?.timestamp || []
    
    return {
      labels: referenceTimestamps.map(formatDate),
      datasets: chartData.map((data, index) => {
        const result = data.chart.result[0]
        const meta = result.meta
        const quotes = result.indicators.quote[0]
        const inv = investments.find(i => i.symbol === meta.symbol) || investments[index]

        return {
          label: `${meta.symbol} - ${meta.shortName.substring(0, 15)}${meta.shortName.length > 15 ? "..." : ""}`,
          data: quotes.close,
          borderColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
          backgroundColor: `${COLOR_PALETTE[index % COLOR_PALETTE.length]}20`,
          borderWidth: 2,
          pointRadius: range === '1d' ? 3 : 0,
          pointHoverRadius: 5,
          tension: 0.1,
          fill: {
            target: "origin",
            above: `${COLOR_PALETTE[index % COLOR_PALETTE.length]}10`,
          },
        }
      }),
    }
  }, [chartData, investments, formatDate, range])

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        },
      },
      title: {
        display: true,
        text: `Investment Performance (${RANGE_OPTIONS.find(r => r.value === range)?.label})`,
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            const currency = context.dataset.label.includes(".NS") ? "INR" : "USD"
            
            return value !== null 
              ? `${label}: ${new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                }).format(value)}`
              : label
          },
        },
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "xy" as const,
        },
        pan: {
          enabled: true,
          mode: "xy" as const,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(value)
        },
      },
    },
  }), [range])

  // Handlers
  const handleRefresh = useCallback(() => {
    // Clear cache for current range/interval
    investments.forEach(inv => {
      const cacheKey = `${inv.symbol}-${range}-${interval}`
      chartDataCache.delete(cacheKey)
    })
    fetchAllData()
  }, [fetchAllData, investments, range, interval])

  const handleRangeChange = useCallback((value: string) => {
    setRange(value)
    // Auto-adjust interval based on range
    setInterval(value === '1d' ? '5m' : value === '5d' ? '1d' : '1wk')
  }, [])

  // Loading and error states
  if (loading && chartData.length === 0) {
    return (
      <div className="w-full h-[500px] bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (error && chartData.length === 0) {
    return (
      <div className="w-full h-[500px] bg-white rounded-lg shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchAllData} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Investment Performance</h3>
          {lastRefresh && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastRefresh.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-end">
          <div className="flex gap-2 w-full">
            <Select value={range} onValueChange={handleRangeChange}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS
                  .filter(option => {
                    if (range === '1d') return ['1m', '5m', '15m'].includes(option.value)
                    if (range === '5d') return ['1h', '1d'].includes(option.value)
                    return ['1d', '1wk', '1mo'].includes(option.value)
                  })
                  .map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="ghost"
            className="h-8 w-8 p-0"
            disabled={Object.values(fetchingStatus).some(Boolean)}
          >
            <RefreshCw className={`h-4 w-4 ${Object.values(fetchingStatus).some(Boolean) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="h-[400px] relative">
        {chartData.length > 0 ? (
          <>
            <Line options={chartOptions} data={chartDataConfig} />
            {(loading || Object.values(fetchingStatus).some(Boolean)) && (
              <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No chart data available
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2">
        <div className="text-xs text-muted-foreground">
          {error && (
            <span className="text-red-500">Some data may not be available. {error}</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground text-right">
          Tip: Scroll to zoom, drag to pan. Click legend items to toggle visibility.
        </div>
      </div>
    </div>
  )
}

export default React.memo(PerformanceChart)