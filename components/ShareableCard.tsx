'use client';

import { forwardRef } from 'react';
import { SeasonData } from '@/lib/color-seasons';

interface ShareableCardProps {
  season: SeasonData;
  format?: 'stories' | 'feed';
}

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  function ShareableCard({ season, format = 'stories' }, ref) {
    const dimensions = format === 'stories'
      ? { width: 1080, height: 1920 }
      : { width: 1200, height: 630 };

    const isStories = format === 'stories';

    return (
      <div
        ref={ref}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          position: 'absolute',
          left: '-9999px',
          top: 0,
        }}
        className="overflow-hidden"
      >
        {/* Background with gradient */}
        <div
          className={`w-full h-full bg-gradient-to-br ${season.gradient} flex flex-col`}
          style={{ padding: isStories ? 60 : 40 }}
        >
          {/* Logo Header */}
          <div className="flex items-center justify-center" style={{ marginBottom: isStories ? 40 : 20 }}>
            <div
              className="bg-white/90 backdrop-blur rounded-full flex items-center justify-center"
              style={{
                padding: isStories ? '16px 32px' : '10px 24px',
              }}
            >
              <span
                className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                style={{ fontSize: isStories ? 32 : 24 }}
              >
                AuraCor
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div
            className="flex-1 bg-white/95 backdrop-blur rounded-3xl flex flex-col items-center justify-center"
            style={{ padding: isStories ? 50 : 30 }}
          >
            {/* Season Icon */}
            <div
              className="rounded-full bg-white shadow-lg flex items-center justify-center"
              style={{
                width: isStories ? 160 : 100,
                height: isStories ? 160 : 100,
                marginBottom: isStories ? 30 : 20,
              }}
            >
              <span style={{ fontSize: isStories ? 80 : 50 }}>
                {season.parentSeason === 'primavera' && '🌸'}
                {season.parentSeason === 'verao' && '☀️'}
                {season.parentSeason === 'outono' && '🍂'}
                {season.parentSeason === 'inverno' && '❄️'}
              </span>
            </div>

            {/* Season Name */}
            <h1
              className="font-bold text-gray-900 text-center"
              style={{
                fontSize: isStories ? 72 : 42,
                marginBottom: isStories ? 12 : 8,
              }}
            >
              {season.name}
            </h1>

            {/* Subtitle */}
            <p
              className="text-gray-600 font-medium text-center"
              style={{
                fontSize: isStories ? 32 : 20,
                marginBottom: isStories ? 50 : 30,
              }}
            >
              {season.subtitle}
            </p>

            {/* Color Palette Title */}
            <p
              className="text-gray-500 font-medium uppercase tracking-wider"
              style={{
                fontSize: isStories ? 20 : 14,
                marginBottom: isStories ? 24 : 16,
              }}
            >
              Minha Paleta de Cores
            </p>

            {/* Color Palette Grid */}
            <div
              className="flex flex-wrap justify-center"
              style={{
                gap: isStories ? 16 : 10,
                maxWidth: isStories ? 900 : 500,
              }}
            >
              {season.palette.slice(0, 12).map((color, index) => (
                <div
                  key={index}
                  className="rounded-xl shadow-md"
                  style={{
                    backgroundColor: color,
                    width: isStories ? 120 : 70,
                    height: isStories ? 120 : 70,
                  }}
                />
              ))}
            </div>

            {/* Characteristics - Stories only */}
            {isStories && (
              <div
                className="w-full"
                style={{ marginTop: 50 }}
              >
                <p
                  className="text-gray-500 font-medium uppercase tracking-wider text-center"
                  style={{ fontSize: 20, marginBottom: 20 }}
                >
                  Suas Características
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {season.characteristics.slice(0, 4).map((char, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-full px-6 py-3"
                      style={{ fontSize: 22 }}
                    >
                      <span className="text-gray-700">{char}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-center"
            style={{ marginTop: isStories ? 40 : 20 }}
          >
            <p
              className="text-white/90 font-medium"
              style={{ fontSize: isStories ? 24 : 16 }}
            >
              @auracor.com.br
            </p>
          </div>
        </div>
      </div>
    );
  }
);
