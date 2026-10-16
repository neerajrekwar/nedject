'use client';

import React from 'react';
import { MockupDevice } from '@/lib/mockup-templates';

interface Props {
  device: MockupDevice;
  orientation: 'portrait' | 'landscape';
  bezelStyle: 'chassis' | 'minimal' | 'frameless';
  chassisColor: string;
  zoomScale: number;
  children: React.ReactNode;
}

export function DeviceFrame({
  device,
  orientation,
  bezelStyle,
  chassisColor,
  zoomScale,
  children,
}: Props) {
  const isLandscape = orientation === 'landscape';
  const width = isLandscape ? device.height : device.width;
  const height = isLandscape ? device.width : device.height;

  // Frame colors
  const finishBorder =
    chassisColor === 'titanium'
      ? '#71717a'
      : chassisColor === 'silver'
      ? '#d4d4d8'
      : chassisColor === 'gold'
      ? '#d97706'
      : '#27272a'; // space-black

  if (bezelStyle === 'frameless') {
    return (
      <div
        className="transition-all duration-300 origin-top shadow-2xl overflow-hidden bg-white border border-zinc-700"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${zoomScale})`,
        }}
      >
        <div className="w-full h-full overflow-y-auto">{children}</div>
      </div>
    );
  }

  // Realistic Chassis Bezel
  return (
    <div
      className="transition-all duration-300 origin-top relative select-none"
      style={{
        transform: `scale(${zoomScale})`,
      }}
    >
      {/* Outer Device Chassis Shell */}
      <div
        className="relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-all overflow-hidden"
        style={{
          width: `${width + device.bezel * 2}px`,
          height: `${height + device.bezel * 2}px`,
          borderRadius: `${device.radius}px`,
          backgroundColor: finishBorder,
          padding: `${device.bezel}px`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.15) inset, 0 30px 60px -12px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Device Screen Bezel inner border */}
        <div
          className="relative w-full h-full bg-black overflow-hidden flex flex-col"
          style={{
            borderRadius: `${Math.max(4, device.radius - device.bezel)}px`,
          }}
        >
          {/* Top Speaker / Dynamic Island / Notch for Mobile & Tablet */}
          {bezelStyle === 'chassis' && device.category === 'mobile' && (
            <div className="absolute top-0 inset-x-0 h-8 z-30 pointer-events-none flex items-center justify-center">
              {device.notchType === 'dynamic-island' && (
                <div className="w-28 h-6 bg-black rounded-full mt-2 border border-zinc-800/80 flex items-center justify-between px-2.5 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-900/60" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                </div>
              )}
              {device.notchType === 'punch-hole' && (
                <div className="w-3.5 h-3.5 bg-black rounded-full mt-2 border border-zinc-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                </div>
              )}
              {device.notchType === 'notch' && (
                <div className="w-40 h-5 bg-black rounded-b-xl border-x border-b border-zinc-800" />
              )}
            </div>
          )}

          {/* Desktop Laptop Notch or Camera Dot */}
          {bezelStyle === 'chassis' && device.category === 'desktop' && device.notchType === 'notch' && (
            <div className="absolute top-0 inset-x-0 h-6 z-30 pointer-events-none flex items-center justify-center">
              <div className="w-36 h-4 bg-black rounded-b-lg border-x border-b border-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700" />
              </div>
            </div>
          )}

          {/* Screen Content Viewport */}
          <div className="w-full h-full overflow-y-auto bg-white relative z-10">{children}</div>

          {/* iOS Home Indicator Bar for Mobile */}
          {device.category === 'mobile' && !isLandscape && (
            <div className="absolute bottom-1 inset-x-0 h-4 z-30 pointer-events-none flex items-center justify-center">
              <div className="w-32 h-1 bg-zinc-400/60 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Laptop Keyboard Base & Hinge (For MacBook Pro Mockup) */}
      {device.id === 'macbook-pro-16' && bezelStyle === 'chassis' && (
        <div className="relative mx-auto -mt-1 flex flex-col items-center">
          {/* Aluminum Display Hinge */}
          <div className="w-32 h-2.5 bg-zinc-700 rounded-b" />
          {/* Keyboard Base Lip */}
          <div
            className="h-4 bg-zinc-800 border-t border-zinc-600 rounded-b-lg shadow-lg flex items-center justify-center"
            style={{ width: `${width + device.bezel * 2 + 80}px` }}
          >
            <div className="w-20 h-1 bg-zinc-900 rounded-full" />
          </div>
        </div>
      )}

      {/* Desktop Stand for Studio Display */}
      {device.id === 'desktop-hd' && bezelStyle === 'chassis' && (
        <div className="relative mx-auto flex flex-col items-center">
          {/* Metal Stand Arm */}
          <div className="w-24 h-16 bg-zinc-700 border-x border-zinc-600" />
          {/* Metal Stand Base */}
          <div className="w-64 h-3 bg-zinc-800 border border-zinc-600 rounded-t shadow-md" />
        </div>
      )}
    </div>
  );
}
