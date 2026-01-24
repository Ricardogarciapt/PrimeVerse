"use client"

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'

interface PositionCalculation {
  positionSize: number
  riskAmount: number
  pipValue: number
  pipDifference: number
  units: number
}

// Function to calculate pip value dynamically based on asset type
const getPipValueForPair = (pair: string, entryPrice?: number): number => {
  const pairUpper = pair.toUpperCase()
  
  // Metals - Gold
  if (pairUpper.includes('XAU') || pairUpper.includes('GOLD')) {
    return 1
  }
  
  // Metals - Silver
  if (pairUpper.includes('XAG') || pairUpper.includes('SILVER')) {
    return 5
  }
  
  // Forex - Majors (USD as second currency) = 10 USD per lot
  if (pairUpper === 'EUR/USD' || pairUpper === 'GBP/USD' || 
      pairUpper === 'AUD/USD' || pairUpper === 'NZD/USD' ||
      pairUpper === 'USD/CHF' || pairUpper === 'USD/CAD' ||
      pairUpper === 'EUR/GBP' || pairUpper === 'AUD/CAD' ||
      pairUpper === 'EUR/AUD' || pairUpper === 'EUR/CAD') {
    return 10
  }
  
  // Forex - JPY pairs = ~9 USD per lot (varies)
  if (pairUpper.includes('JPY')) {
    return 9.09
  }
  
  // Indices - USD per point
  if (pairUpper === 'US30') return 1
  if (pairUpper === 'NAS100') return 20
  if (pairUpper === 'SPX500') return 50
  if (pairUpper === 'UK100') return 10
  if (pairUpper === 'GER40') return 25
  
  // Crypto - USD per $1 movement
  if (pairUpper === 'BTC/USD' || pairUpper === 'BTCUSD' || 
      pairUpper === 'ETH/USD' || pairUpper === 'ETHUSD') {
    return 1
  }
  if (pairUpper === 'SOL/USD' || pairUpper === 'SOLUSD') {
    return 0.1
  }
  
  // Default: 10 USD per lot (standard forex)
  return 10
}

const PRIMEVERSE_COLORS = {
  primary: "#015BF9",
  white: "#FFFFFF",
  dark: "#040507",
  darkBlue: "#1200DE",
  lightGray: "#EDECED",
}

export default function PositionCalculatorEN() {
  const [accountBalance, setAccountBalance] = useState('10000')
  const [riskPercent, setRiskPercent] = useState('1')
  const [stopLossPips, setStopLossPips] = useState('20')
  const [currencyPair, setCurrencyPair] = useState('EUR/USD')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [calculation, setCalculation] = useState<PositionCalculation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calculatedPips, setCalculatedPips] = useState<number | null>(null)

  const popularPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD',
    'USD/CAD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY',
    'XAU/USD', 'XAG/USD',
    'US30', 'NAS100', 'SPX500', 'UK100',
    'BTC/USD', 'ETH/USD', 'SOL/USD'
  ]

  // Get pip factor based on asset type
  const getPipFactor = (pair: string): number => {
    const pairUpper = pair.toUpperCase()
    if (pairUpper.includes('JPY')) return 100
    if (pairUpper.includes('XAU') || pairUpper.includes('GOLD')) return 100
    if (pairUpper.includes('XAG') || pairUpper.includes('SILVER')) return 100
    if (['US30', 'NAS100', 'SPX500', 'UK100', 'GER40'].includes(pairUpper)) return 1
    if (pairUpper.includes('BTC') || pairUpper.includes('ETH') || pairUpper.includes('SOL')) return 1
    return 10000
  }

  // Get correct label for measurement unit
  const getUnitLabel = (pair: string): string => {
    const pairUpper = pair.toUpperCase()
    if (pairUpper.includes('XAU') || pairUpper.includes('GOLD')) return 'Points (0.01)'
    if (pairUpper.includes('XAG') || pairUpper.includes('SILVER')) return 'Points (0.001)'
    if (['US30', 'NAS100', 'SPX500', 'UK100', 'GER40'].includes(pairUpper)) return 'Points'
    if (pairUpper.includes('BTC') || pairUpper.includes('ETH') || pairUpper.includes('SOL')) return 'USD'
    if (pairUpper.includes('JPY')) return 'Pips (0.01)'
    return 'Pips (0.0001)'
  }

  // Calculate pips automatically if Entry and Stop Loss are entered
  useEffect(() => {
    if (entryPrice && stopLossPrice) {
      const entry = parseFloat(entryPrice)
      const stopLoss = parseFloat(stopLossPrice)
      
      if (!isNaN(entry) && !isNaN(stopLoss) && entry > 0 && stopLoss > 0) {
        const pipFactor = getPipFactor(currencyPair)
        const diff = Math.abs(entry - stopLoss) * pipFactor
        setCalculatedPips(Math.round(diff))
        setStopLossPips(Math.round(diff).toString())
      }
    }
  }, [entryPrice, stopLossPrice, currencyPair])

  // Calculate position
  const calculatePosition = () => {
    setError(null)
    
    try {
      const balance = parseFloat(accountBalance)
      const risk = parseFloat(riskPercent)
      const pips = parseFloat(stopLossPips)
      
      if (isNaN(balance) || balance <= 0) {
        setError('Invalid account balance')
        return
      }
      
      if (isNaN(risk) || risk <= 0 || risk > 100) {
        setError('Invalid risk percentage (0-100)')
        return
      }
      
      if (isNaN(pips) || pips <= 0) {
        setError('Invalid Stop Loss in pips')
        return
      }
      
      const riskAmount = balance * (risk / 100)
      const entry = entryPrice ? parseFloat(entryPrice) : undefined
      const pipValue = getPipValueForPair(currencyPair, entry)
      const pipDifference = pips
      const positionSize = riskAmount / (pipDifference * pipValue)
      
      const pairUpper = currencyPair.toUpperCase()
      let units: number
      
      if (pairUpper.includes('XAU') || pairUpper.includes('GOLD')) {
        units = positionSize * 100
      } else if (pairUpper.includes('XAG') || pairUpper.includes('SILVER')) {
        units = positionSize * 5000
      } else if (['US30', 'NAS100', 'SPX500', 'UK100', 'GER40'].includes(pairUpper) ||
               pairUpper.includes('BTC') || pairUpper.includes('ETH') || pairUpper.includes('SOL')) {
        units = positionSize * 1
      } else {
        units = positionSize * 100000
      }
      
      setCalculation({
        positionSize,
        riskAmount,
        pipValue,
        pipDifference,
        units
      })
    } catch (err) {
      setError('Error calculating position')
      console.error(err)
    }
  }

  return (
    <div 
      className="rounded-lg border p-6"
      style={{ 
        backgroundColor: PRIMEVERSE_COLORS.dark + 'CC', 
        borderColor: PRIMEVERSE_COLORS.primary + '50' 
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5" style={{ color: PRIMEVERSE_COLORS.primary }} />
        <h3 
          className="text-xl font-bold"
          style={{ 
            color: PRIMEVERSE_COLORS.primary, 
            fontFamily: "'Gonero ExtExp Bolo', sans-serif" 
          }}
        >
          Position Size Calculator
        </h3>
      </div>

      <div className="space-y-4">
        {/* Help information */}
        <div 
          className="rounded-lg border p-3 flex items-start gap-2"
          style={{ 
            backgroundColor: '#FFA500' + '10', 
            borderColor: '#FFA500' + '30' 
          }}
        >
          <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: '#FFA500' }} />
          <p className="text-xs" style={{ color: PRIMEVERSE_COLORS.lightGray }}>
            Calculate the ideal position size based on your maximum risk per trade
          </p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account balance */}
          <div className="space-y-2">
            <label htmlFor="balance" className="block text-sm font-medium" style={{ color: PRIMEVERSE_COLORS.lightGray }}>
              Account Balance
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4" style={{ color: PRIMEVERSE_COLORS.primary }} />
              <input
                id="balance"
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: PRIMEVERSE_COLORS.darkBlue, 
                  borderColor: PRIMEVERSE_COLORS.primary + '60', 
                  color: PRIMEVERSE_COLORS.white,
                  fontFamily: "'Gonero ExtExp Regular', sans-serif"
                }}
                placeholder="10000"
              />
            </div>
          </div>

          {/* Risk percentage */}
          <div className="space-y-2">
            <label htmlFor="risk" className="block text-sm font-medium" style={{ color: PRIMEVERSE_COLORS.lightGray }}>
              Risk per Trade (%)
            </label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-3 h-4 w-4" style={{ color: PRIMEVERSE_COLORS.primary }} />
              <input
                id="risk"
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: PRIMEVERSE_COLORS.darkBlue, 
                  borderColor: PRIMEVERSE_COLORS.primary + '60', 
                  color: PRIMEVERSE_COLORS.white,
                  fontFamily: "'Gonero ExtExp Regular', sans-serif"
                }}
                placeholder="1"
              />
            </div>
          </div>

          {/* Currency pair */}
          <div className="space-y-2">
            <label htmlFor="pair" className="block text-sm font-medium" style={{ color: PRIMEVERSE_COLORS.lightGray }}>
              Currency Pair
            </label>
            <select
              id="pair"
              value={currencyPair}
              onChange={(e) => setCurrencyPair(e.target.value)}
              className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: PRIMEVERSE_COLORS.darkBlue, 
                borderColor: PRIMEVERSE_COLORS.primary + '60', 
                color: PRIMEVERSE_COLORS.white,
                fontFamily: "'Gonero ExtExp Regular', sans-serif"
              }}
            >
              {popularPairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          {/* Stop Loss in pips */}
          <div className="space-y-2">
            <label htmlFor="sl" className="block text-sm font-medium" style={{ color: PRIMEVERSE_COLORS.lightGray }}>
              Stop Loss ({getUnitLabel(currencyPair)})
            </label>
            <input
              id="sl"
              type="number"
              value={stopLossPips}
              onChange={(e) => setStopLossPips(e.target.value)}
              className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: PRIMEVERSE_COLORS.darkBlue, 
                borderColor: PRIMEVERSE_COLORS.primary + '60', 
                color: PRIMEVERSE_COLORS.white,
                fontFamily: "'Gonero ExtExp Regular', sans-serif"
              }}
              placeholder="20"
            />
          </div>

          {/* Entry Price (optional) */}
          <div className="space-y-2">
            <label htmlFor="entry" className="block text-sm font-medium" style={{ color: PRIMEVERSE_COLORS.lightGray }}>
              Entry Price (optional)
            </label>
            <input
              id="entry"
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: PRIMEVERSE_COLORS.darkBlue, 
                borderColor: PRIMEVERSE_COLORS.primary + '60', 
                color: PRIMEVERSE_COLORS.white,
                fontFamily: "'Gonero ExtExp Regular', sans-serif"
              }}
              placeholder="1.0850"
              step="0.0001"
            />
          </div>

          {/* Stop Loss Price (optional) */}
          <div className="space-y-2">
            <label htmlFor="stop-loss" className="block text-sm font-medium" style={{ color: PRIMEVERSE_COLORS.lightGray }}>
              Stop Loss Price (optional)
            </label>
            <input
              id="stop-loss"
              type="number"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: PRIMEVERSE_COLORS.darkBlue, 
                borderColor: PRIMEVERSE_COLORS.primary + '60', 
                color: PRIMEVERSE_COLORS.white,
                fontFamily: "'Gonero ExtExp Regular', sans-serif"
              }}
              placeholder="1.0830"
              step="0.0001"
            />
          </div>
        </div>

        {/* Show calculated pips */}
        {calculatedPips && (
          <div className="text-xs" style={{ color: PRIMEVERSE_COLORS.primary }}>
            ✓ {getUnitLabel(currencyPair)} calculated automatically: {calculatedPips}
          </div>
        )}

        {/* Calculate button */}
        <button
          onClick={calculatePosition}
          className="w-full px-4 py-2 rounded-md font-medium transition-colors"
          style={{ 
            backgroundColor: PRIMEVERSE_COLORS.primary, 
            borderColor: PRIMEVERSE_COLORS.primary, 
            color: PRIMEVERSE_COLORS.white,
            fontFamily: "'Gonero ExtExp Regular', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          <Calculator className="w-4 h-4 inline mr-2" />
          Calculate Position
        </button>

        {/* Error */}
        {error && (
          <div 
            className="rounded-lg border p-3 flex items-start gap-2"
            style={{ 
              backgroundColor: '#FF4D4D' + '10', 
              borderColor: '#FF4D4D' + '50' 
            }}
          >
            <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: '#FF4D4D' }} />
            <p style={{ color: '#FF4D4D' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {calculation && (
          <div 
            className="mt-6 space-y-4 p-4 rounded-lg border"
            style={{ 
              backgroundColor: PRIMEVERSE_COLORS.primary + '10', 
              borderColor: PRIMEVERSE_COLORS.primary + '30' 
            }}
          >
            <h3 
              className="text-lg font-bold"
              style={{ 
                color: PRIMEVERSE_COLORS.primary, 
                fontFamily: "'Gonero ExtExp Bolo', sans-serif" 
              }}
            >
              Position Results
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: PRIMEVERSE_COLORS.lightGray + 'CC' }}>Position Size</p>
                <p className="text-xl font-bold" style={{ color: PRIMEVERSE_COLORS.white }}>
                  {calculation.positionSize.toFixed(2)} <span style={{ color: PRIMEVERSE_COLORS.primary }}>Lots</span>
                </p>
              </div>
              
              <div>
                <p className="text-xs mb-1" style={{ color: PRIMEVERSE_COLORS.lightGray + 'CC' }}>Units</p>
                <p className="text-xl font-bold" style={{ color: PRIMEVERSE_COLORS.white }}>
                  {calculation.units.toFixed(0)}
                </p>
              </div>
              
              <div>
                <p className="text-xs mb-1" style={{ color: PRIMEVERSE_COLORS.lightGray + 'CC' }}>Risk Amount</p>
                <p className="text-xl font-bold" style={{ color: '#FF4D4D' }}>
                  ${calculation.riskAmount.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-xs mb-1" style={{ color: PRIMEVERSE_COLORS.lightGray + 'CC' }}>Pip Value</p>
                <p className="text-xl font-bold" style={{ color: '#00C084' }}>
                  ${calculation.pipValue.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Risk/reward summary */}
            <div 
              className="mt-4 p-3 rounded border"
              style={{ 
                backgroundColor: PRIMEVERSE_COLORS.dark + 'CC', 
                borderColor: PRIMEVERSE_COLORS.primary + '60' 
              }}
            >
              <p className="text-xs mb-2" style={{ color: PRIMEVERSE_COLORS.lightGray + 'CC' }}>Risk Summary</p>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: PRIMEVERSE_COLORS.lightGray }}>Risk per trade:</span>
                <span className="text-sm font-bold" style={{ color: '#FF4D4D' }}>
                  {riskPercent}% (${calculation.riskAmount.toFixed(2)})
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm" style={{ color: PRIMEVERSE_COLORS.lightGray }}>Stop Loss:</span>
                <span className="text-sm font-bold" style={{ color: '#FFA500' }}>
                  {stopLossPips} {getUnitLabel(currencyPair)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
