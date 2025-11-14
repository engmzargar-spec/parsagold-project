'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';

type PriceData = {
  symbol: string;
  label: string;
  icon: string;
  apiEndpoint: string;
  currency: string;
};

type PriceState = {
  value: number | null;
  change: number | null;
  change_percent: number | null;
  color: string;
  flash: boolean;
};

const marketPrices: PriceData[] = [
  { 
    symbol: 'XAUUSD', 
    label: 'انس طلا', 
    icon: '/icons/gold.png',
    apiEndpoint: '/market/gold',
    currency: 'USD'
  },
  { 
    symbol: 'XAGUSD', 
    label: 'انس نقره', 
    icon: '/icons/silver.png',
    apiEndpoint: '/market/silver', 
    currency: 'USD'
  },
  { 
    symbol: 'BRENT', 
    label: 'نفت برنت', 
    icon: '/icons/brentoil.png',
    apiEndpoint: '/market/brent',
    currency: 'USD'
  },
  { 
    symbol: 'USDT', 
    label: 'تتر به تومان', 
    icon: '/icons/usdt.png',
    apiEndpoint: '/market/usdt',
    currency: 'IRR'
  }
];

export default function LivePrices() {
  const [priceMap, setPriceMap] = useState<Record<string, PriceState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const lastUpdateRef = useRef<number>(0);

  // استفاده از useCallback برای جلوگیری از infinite loop
  const fetchMarketPrices = useCallback(async () => {
    // جلوگیری از درخواست‌های مکرر در زمان کوتاه
    const now = Date.now();
    if (now - lastUpdateRef.current < 5000) {
      return;
    }
    lastUpdateRef.current = now;

    try {
      console.log('🔄 دریافت قیمت‌های زنده از بک‌اند...');
      setError(null);
      
      const updated: Record<string, PriceState> = { ...priceMap };

      for (const item of marketPrices) {
        try {
          const response = await fetch(`http://localhost:8000${item.apiEndpoint}`);
          console.log(`📡 ${item.label} - وضعیت:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${item.label}:`, data);
            
            const currentPrice = data.price || data.current_price || null;
            const change = data.change || data.price_change || null;
            const changePercent = data.change_percent || data.price_change_percent || null;

            const prevPrice = priceMap[item.symbol]?.value;
            
            let color = 'text-gray-300';
            let flash = false;

            if (typeof currentPrice === 'number' && typeof prevPrice === 'number') {
              if (currentPrice > prevPrice) {
                color = 'text-green-400';
                flash = true;
              } else if (currentPrice < prevPrice) {
                color = 'text-red-400';
                flash = true;
              }
            } else if (!initialized.current) {
              color = 'text-yellow-400';
            }

            updated[item.symbol] = {
              value: currentPrice,
              change: change,
              change_percent: changePercent,
              color,
              flash
            };
          } else {
            console.warn(`❌ ${item.label} - خطای API:`, response.status);
            // استفاده از داده‌های تستی در صورت خطا
            const mockData = {
              'XAUUSD': { value: 1950.25, change: 12.50, change_percent: 0.65 },
              'XAGUSD': { value: 24.80, change: -0.30, change_percent: -1.20 },
              'BRENT': { value: 82.45, change: 1.20, change_percent: 1.48 },
              'USDT': { value: 112150, change: 150, change_percent: 0.25 }
            };

            const mock = mockData[item.symbol as keyof typeof mockData];
            updated[item.symbol] = {
              value: mock.value,
              change: mock.change,
              change_percent: mock.change_percent,
              color: mock.change >= 0 ? 'text-green-400' : 'text-red-400',
              flash: false
            };
          }
        } catch (error) {
          console.warn(`⚠️ خطا در دریافت ${item.label}:`, error);
          // استفاده از داده‌های تستی در صورت خطا
          const mockData = {
            'XAUUSD': { value: 1950.25, change: 12.50, change_percent: 0.65 },
            'XAGUSD': { value: 24.80, change: -0.30, change_percent: -1.20 },
            'BRENT': { value: 82.45, change: 1.20, change_percent: 1.48 },
            'USDT': { value: 112150, change: 150, change_percent: 0.25 }
          };

          const mock = mockData[item.symbol as keyof typeof mockData];
          updated[item.symbol] = {
            value: mock.value,
            change: mock.change,
            change_percent: mock.change_percent,
            color: mock.change >= 0 ? 'text-green-400' : 'text-red-400',
            flash: false
          };
        }
      }

      initialized.current = true;
      setPriceMap(updated);
      setLoading(false);

      // خاموش کردن flash بعد از 500ms
      setTimeout(() => {
        setPriceMap(prev => {
          const reset = { ...prev };
          Object.keys(reset).forEach((key) => {
            reset[key].flash = false;
          });
          return reset;
        });
      }, 500);

    } catch (error) {
      console.error('💥 خطا در دریافت قیمت‌ها:', error);
      setError('خطا در اتصال به سرور');
      setLoading(false);
    }
  }, []); // ✅ dependency array خالی - فقط یکبار اجرا میشه

  useEffect(() => {
    fetchMarketPrices();
    
    // بروزرسانی خودکار هر 30 ثانیه
    const interval = setInterval(fetchMarketPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketPrices]); // ✅ فقط وابسته به fetchMarketPrices

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return '—';
    
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price) + ' $';
    } else {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
  };

  const formatChange = (change: number | null) => {
    if (change === null) return '—';
    
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const renderCard = (marketItem: PriceData, isMobile: boolean) => {
    const state = priceMap[marketItem.symbol];
    const current = state?.value;
    const change = state?.change;
    const changePercent = state?.change_percent;
    const color = state?.color || 'text-gray-300';
    const flash = state?.flash;

    return (
      <div
        key={marketItem.symbol}
        className={`
          bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-yellow-500/20
          ${isMobile ? 'p-4 flex flex-row items-center gap-4 w-full' : 'p-6 flex flex-col items-center w-full max-w-[280px]'}
          shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-105
          ${flash ? 'ring-2 ring-yellow-400' : ''}
        `}
      >
        {/* آیکون */}
        <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16 mb-4'} relative`}>
          <Image
            src={marketItem.icon}
            alt={marketItem.label}
            fill
            className="object-contain"
            sizes={isMobile ? "48px" : "64px"}
          />
        </div>
        
        <div className={`${isMobile ? 'flex flex-col items-start text-right flex-1' : 'flex flex-col items-center text-center w-full'}`}>
          <span className={`text-sm ${isMobile ? 'text-xs' : 'text-base'} text-gray-300 mb-2 truncate w-full`}>
            {marketItem.label}
          </span>
          
          <span
            className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} ${color} transition-colors duration-500 ${flash ? 'animate-pulse' : ''} mb-2`}
          >
            {formatPrice(current, marketItem.currency)}
          </span>

          {(change !== null && changePercent !== null) && (
            <div className={`flex gap-2 ${isMobile ? 'text-xs' : 'text-sm'} ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span>{formatChange(change)}</span>
              <span>({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl flex justify-center my-6">
        <div className="text-yellow-400 text-lg">⏳ در حال دریافت قیمت‌های زنده...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl text-center my-8 p-6 bg-red-900/20 rounded-xl border border-red-500">
        <div className="text-red-400 text-lg mb-2">⚠️ {error}</div>
        <div className="text-red-300 text-sm">استفاده از داده‌های تستی</div>
      </div>
    );
  }

  return (
    <>
      {/* موبایل */}
      <div className="w-full max-w-7xl grid grid-cols-2 gap-6 my-8 md:hidden">
        {marketPrices.map(item => renderCard(item, true))}
      </div>

      {/* دسکتاپ */}
      <div className="hidden md:grid md:grid-cols-4 gap-8 my-8 w-full max-w-7xl justify-items-center">
        {marketPrices.map(item => renderCard(item, false))}
      </div>
    </>
  );
}