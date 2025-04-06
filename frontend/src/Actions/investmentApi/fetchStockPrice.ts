/** @format */

"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { CREATE_INVEST_URL } from "@/lib/EndPointApi"
import axios from "axios"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

interface YahooFinanceResponse {
  quoteSummary: {
    result: Array<{
      price: {
        regularMarketPrice: {
          raw: number
          fmt: string
        }
        currency: string
        symbol: string
        longName?: string
        // Other available fields from the response
        regularMarketChangePercent?: {
          raw: number
          fmt: string
        }
        marketState?: string
        // Add other fields you need
      }
    }>
    error?: any
  }
}

interface StockPriceResponse {
  price: number
  formattedPrice: string
  currency: string
  symbol: string
  name?: string
  changePercent?: number
  formattedChangePercent?: string
  marketState?: string
  error?: string
}

export const getStockPrice = async (
  symbol: string
): Promise<StockPriceResponse> => {
  const options = {
    method: "GET",
    url: "https://yahoo-finance166.p.rapidapi.com/api/stock/get-price",
    params: {
      region: symbol.endsWith(".NS") ? "IN" : "US",
      symbol: symbol,
    },
    headers: {
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY || "",
      "x-rapidapi-host": "yahoo-finance166.p.rapidapi.com",
    },
    timeout: 5000,
  }

  try {
    // console.log(options)
    const response = await axios.request<YahooFinanceResponse>(options)
    // console.log(response)

    if (!response.data?.quoteSummary?.result?.[0]?.price) {
      return {
        price: 0,
        formattedPrice: "N/A",
        currency: symbol.endsWith(".NS") ? "INR" : "USD",
        symbol,
        error: "Invalid response format",
      }
    }

    const priceData = response.data.quoteSummary.result[0].price

    return {
      price: priceData.regularMarketPrice.raw,
      formattedPrice: priceData.regularMarketPrice.fmt,
      currency: priceData.currency || (symbol.endsWith(".NS") ? "INR" : "USD"),
      symbol: priceData.symbol,
      name: priceData.longName,
      changePercent: priceData.regularMarketChangePercent?.raw,
      formattedChangePercent: priceData.regularMarketChangePercent?.fmt,
      marketState: priceData.marketState,
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return {
      price: 0,
      formattedPrice: "N/A",
      currency: symbol.endsWith(".NS") ? "INR" : "USD",
      symbol,
      error: "Failed to fetch stock price",
    }
  }
}

// Updated investment action with better error handling
export const addInvestmentAction = async (
  prevState: any,
  formData: FormData
): Promise<{
  status?: number
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
  error?: string
  data?: any
}> => {
   const session = await getServerSession(authOptions)
    if (!session?.token) {
      return {
        status: 401,
        message: "Unauthorized - Please login first",
        errors: {},
      }
    }
  
  const symbol = formData.get("symbol") as string
  if (!symbol) return { error: "Symbol is required" }

  try {
    // First get current price
    const priceData = await getStockPrice(symbol)
    if (priceData.error) {
      return { error: priceData.error }
    }

    const investmentData = {
      symbol,
      accountId: formData.get("accountId") as string,
      name: (formData.get("name") as string) || priceData.name || symbol,
      type: formData.get("type") as "stock" | "mutual-fund" | "crypto",
      quantity: Number(formData.get("quantity")) || 1,
      buyPrice: Number(formData.get("buyPrice")) || priceData.price,
      currentPrice: priceData.price,
      buyDate:
        (formData.get("buyDate") as string) ||
        new Date().toISOString().split("T")[0],
    }

    // Validate
    if (investmentData.quantity <= 0)
      return { error: "Quantity must be positive" }
    if (investmentData.buyPrice <= 0)
      return { error: "Buy price must be positive" }

    // Save to database (example with Prisma)
    // await prisma.investment.create({ data: investmentData })
    console.log("Creating investment:", investmentData)

  const response = await axios.post(CREATE_INVEST_URL, investmentData, {
    headers: {
      Authorization: `${session?.token}`,
      "Content-Type": "application/json",
    },
  })
  console.log(response.data)
  
    revalidatePath("/investments")
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("Error in addInvestmentAction:", error)
 
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add investment",
     
    }
  }
}

// Utility function to refresh multiple stock prices
export const refreshStockPrices = async (symbols: string[]) => {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const data = await getStockPrice(symbol)
      if (!data.error) {
        // Update database (example with Prisma)
        // await prisma.investment.updateMany({
        //   where: { symbol },
        //   data: { currentPrice: data.price }
        // })
      }
      return { ...data }
    })
  )

  revalidatePath("/investments")
  return results
}
