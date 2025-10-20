// components/dashboard/WorldMarketMap.tsx
'use client';

import { useState, useEffect } from 'react';

interface MarketTime {
  city: string;
  time: string;
  isOpen: boolean;
  offset: number;
  marketOpen: number;
  marketClose: number;
  timeRemaining: string;
  progress: number;
}

interface WorldMarketMapProps {
  isDark: boolean;
}

export default function WorldMarketMap({ isDark }: WorldMarketMapProps) {
  const [localTimes, setLocalTimes] = useState<MarketTime[]>([]);
  const [currentTime, setCurrentTime] = useState('');

  // داده‌های ثابت شهرها
  const citiesData = [
    { name: 'سیدنی', offset: 11, marketOpen: 9, marketClose: 17, emoji: '🇦🇺' },
    { name: 'توکیو', offset: 9, marketOpen: 9, marketClose: 15, emoji: '🇯🇵' },
    { name: 'تهران', offset: 3.5, marketOpen: 9, marketClose: 16, emoji: '🇮🇷' },
    { name: 'لندن', offset: 1, marketOpen: 8, marketClose: 16, emoji: '🇬🇧' },
    { name: 'نیویورک', offset: -4, marketOpen: 9, marketClose: 16, emoji: '🇺🇸' },
    { name: 'شیکاگو', offset: -5, marketOpen: 8, marketClose: 15, emoji: '🇺🇸' }
  ];

  const calculateMarketProgress = (currentHour: number, currentMinute: number, marketOpen: number, marketClose: number) => {
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const marketOpenMinutes = marketOpen * 60;
    const marketCloseMinutes = marketClose * 60;
    const totalMarketMinutes = marketCloseMinutes - marketOpenMinutes;
    
    if (currentHour < marketOpen) {
      return 0;
    } else if (currentHour >= marketClose) {
      return 100;
    } else {
      const passedMinutes = currentTotalMinutes - marketOpenMinutes;
      return (passedMinutes / totalMarketMinutes) * 100;
    }
  };

  const calculateTimeRemaining = (currentHour: number, currentMinute: number, marketOpen: number, marketClose: number) => {
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const marketOpenMinutes = marketOpen * 60;
    const marketCloseMinutes = marketClose * 60;

    if (currentHour >= marketOpen && currentHour < marketClose) {
      const remainingMinutes = marketCloseMinutes - currentTotalMinutes;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      if (hours === 0) {
        return `${minutes}دقیقه تا بسته شدن`;
      }
      return `${hours}ساعت و ${minutes}دقیقه`;
    } else if (currentHour < marketOpen) {
      const remainingMinutes = marketOpenMinutes - currentTotalMinutes;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      if (hours === 0) {
        return `${minutes}دقیقه تا باز شدن`;
      }
      return `${hours}ساعت و ${minutes}دقیقه`;
    } else {
      const remainingMinutes = (24 * 60 - currentTotalMinutes) + marketOpenMinutes;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      if (hours === 0) {
        return `${minutes}دقیقه تا باز شدن`;
      }
      return `${hours}ساعت و ${minutes}دقیقه`;
    }
  };

  const getTimeOfDay = (hour: number) => {
    if (hour >= 5 && hour < 12) return '☀️ صبح';
    if (hour >= 12 && hour < 17) return '🌤️ ظهر';
    if (hour >= 17 && hour < 20) return '🌅 عصر';
    return '🌙 شب';
  };

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fa-IR'));
      
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);

      const times = citiesData.map(city => {
        const localTime = new Date(utc + (city.offset * 3600000));
        const localHours = localTime.getHours();
        const localMinutes = localTime.getMinutes();
        const isOpen = localHours >= city.marketOpen && localHours < city.marketClose;
        
        const timeRemaining = calculateTimeRemaining(localHours, localMinutes, city.marketOpen, city.marketClose);
        const progress = calculateMarketProgress(localHours, localMinutes, city.marketOpen, city.marketClose);

        return {
          city: city.name,
          time: localTime.toLocaleTimeString('fa-IR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          isOpen,
          offset: city.offset,
          marketOpen: city.marketOpen,
          marketClose: city.marketClose,
          timeRemaining,
          progress,
          emoji: city.emoji,
          timeOfDay: getTimeOfDay(localHours)
        };
      });

      setLocalTimes(times);
    };

    // تأخیر برای جلوگیری از hydration mismatch
    const timeout = setTimeout(() => {
      updateTimes();
      const interval = setInterval(updateTimes, 30000);
      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`rounded-2xl p-4 border-2 mb-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/40' 
        : 'bg-gradient-to-br from-white to-amber-50 border-amber-500/50'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-base font-bold transition-colors duration-300 ${
          isDark ? 'text-yellow-400' : 'text-amber-600'
        }`}>
          ⏰ ساعت بازارهای جهانی
        </h3>
        {/* زمان ثابت بدون تغییر لحظه‌ای */}
        <div className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
          isDark 
            ? 'text-blue-400 bg-blue-500/20' 
            : 'text-blue-600 bg-blue-500/20'
        }`}>
          {currentTime || '--:--:--'}
        </div>
      </div>

      {/* کارت‌های بازارها - کامپکت */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {localTimes.map((market, index) => (
          <div 
            key={market.city}
            className={`group relative p-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
              market.isOpen
                ? isDark 
                  ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/50' 
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-400'
                : isDark
                  ? 'bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500/50'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-400'
            }`}
          >
            {/* هدر کارت */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-sm">{market.emoji}</span>
                <h4 className={`text-xs font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {market.city}
                </h4>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                market.isOpen ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
            </div>

            {/* نمایش زمان */}
            <div className="text-center mb-2">
              <div className={`text-lg font-bold mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {market.time}
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {market.timeOfDay.split(' ')[1]}
              </div>
            </div>

            {/* نوار پیشرفت */}
            {market.isOpen && (
              <div className="mb-2">
                <div className="w-full h-1 rounded-full bg-gray-700/30">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                    style={{ width: `${market.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* اطلاعات بازار */}
            <div className={`text-[10px] text-center ${
              market.isOpen 
                ? 'text-green-400' 
                : isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              {market.timeRemaining.split(' ')[0]}
            </div>

            {/* Tooltip برای اطلاعات کامل */}
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 border ${
              isDark 
                ? 'bg-gray-900 text-white border-yellow-500/30' 
                : 'bg-white text-gray-900 border-amber-500/30 shadow-lg'
            }`}>
              <div className="font-bold mb-1">{market.city}</div>
              <div>ساعت کاری: {market.marketOpen}:00 - {market.marketClose}:00</div>
              <div className={market.isOpen ? 'text-green-400' : 'text-yellow-400'}>
                {market.timeRemaining}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* وضعیت کلی - کامپکت */}
      <div className={`text-center p-2 rounded-lg border text-xs ${
        isDark 
          ? 'bg-gray-800/50 border-yellow-500/30' 
          : 'bg-amber-100 border-amber-500/30'
      }`}>
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>باز ({localTimes.filter(m => m.isOpen).length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>بسته ({localTimes.filter(m => !m.isOpen).length})</span>
          </div>
        </div>
      </div>
    </div>
  );
}