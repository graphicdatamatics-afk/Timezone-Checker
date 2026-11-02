import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BaseTimeInput, TimezoneLocation } from './types/timezone';
import { CORE_PRIORITY_LOCATIONS } from './data/timezones';
import { calculateAllZoneTimes, getCurrentLiveTimeInZone } from './utils/timeCalculations';
import { Header } from './components/Header';
import { TimeInputControl } from './components/TimeInputControl';
import { PriorityCardsGrid } from './components/PriorityCardsGrid';
import { OverlapTimelineMatrix } from './components/OverlapTimelineMatrix';
import { ComparisonTable } from './components/ComparisonTable';
import { AddCityModal } from './components/AddCityModal';
import { MeetingCopyModal } from './components/MeetingCopyModal';

export default function App() {
  // Active locations list (starts with the 4 core priorities)
  const [locations, setLocations] = useState<TimezoneLocation[]>(CORE_PRIORITY_LOCATIONS);

  // Selected base location (default: Bangalore, KA, India)
  const [refLocationId, setRefLocationId] = useState<string>('bangalore');

  // Base 12-hour time and date input state (default: 3 November 2026, 9:30 AM)
  const [baseInput, setBaseInput] = useState<BaseTimeInput>({
    hour12: 9,
    minute: 30,
    ampm: 'AM',
    date: '2026-11-03',
  });

  // Live ticking mode
  const [isLive, setIsLive] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Current ref location object
  const refLocation = useMemo(() => {
    return locations.find((l) => l.id === refLocationId) || locations[0];
  }, [locations, refLocationId]);

  // Sync to current real-world time for selected base
  const syncToCurrentLive = useCallback(() => {
    const liveTime = getCurrentLiveTimeInZone(refLocation.timeZone);
    setBaseInput(liveTime);
  }, [refLocation.timeZone]);

  // Live ticking timer
  useEffect(() => {
    if (!isLive) return;

    // Immediately sync
    syncToCurrentLive();

    const interval = setInterval(() => {
      syncToCurrentLive();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, syncToCurrentLive]);

  // User manual edits stop live mode
  const handleBaseInputChange = (newInput: BaseTimeInput) => {
    if (isLive) setIsLive(false);
    setBaseInput(newInput);
  };

  const handleSelectRefLocation = (id: string) => {
    setRefLocationId(id);
    if (isLive) {
      const targetLoc = locations.find((l) => l.id === id);
      if (targetLoc) {
        setBaseInput(getCurrentLiveTimeInZone(targetLoc.timeZone));
      }
    }
  };

  const handleSetPreset = (hour12: number, minute: number, ampm: 'AM' | 'PM') => {
    if (isLive) setIsLive(false);
    setBaseInput((prev) => ({ ...prev, hour12, minute, ampm }));
  };

  const handleSelectHourFromMatrix = (hour12: number, ampm: 'AM' | 'PM') => {
    if (isLive) setIsLive(false);
    setBaseInput((prev) => ({ ...prev, hour12, minute: 0, ampm }));
  };

  // Add / Remove locations
  const handleAddLocation = (loc: TimezoneLocation) => {
    if (!locations.some((l) => l.id === loc.id)) {
      setLocations((prev) => [...prev, loc]);
    }
  };

  const handleRemoveLocation = (id: string) => {
    // Prevent removing core 4
    const target = locations.find((l) => l.id === id);
    if (target?.isCore) return;

    setLocations((prev) => prev.filter((l) => l.id !== id));
    if (refLocationId === id) {
      setRefLocationId('bangalore');
    }
  };

  const handleResetToCore = () => {
    setLocations(CORE_PRIORITY_LOCATIONS);
    if (!CORE_PRIORITY_LOCATIONS.some((l) => l.id === refLocationId)) {
      setRefLocationId('bangalore');
    }
  };

  // Calculate times for all locations
  const calculatedTimes = useMemo(() => {
    return calculateAllZoneTimes(locations, refLocationId, baseInput);
  }, [locations, refLocationId, baseInput]);

  const coreCalculatedTimes = useMemo(() => {
    return calculatedTimes.filter((c) => c.location.isCore);
  }, [calculatedTimes]);

  const extraCalculatedTimes = useMemo(() => {
    return calculatedTimes.filter((c) => !c.location.isCore);
  }, [calculatedTimes]);

  return (
    <div className="min-h-screen bg-[#080a10] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/5 blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <Header
          isLive={isLive}
          onToggleLive={() => setIsLive(!isLive)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Master Control Deck: Base Selector + 12-Hour Input + Presets + Scrubber */}
        <TimeInputControl
          locations={locations}
          refLocationId={refLocationId}
          onSelectRefLocation={handleSelectRefLocation}
          baseInput={baseInput}
          onChangeBaseInput={handleBaseInputChange}
          isLive={isLive}
          onSetPreset={handleSetPreset}
          onSyncCurrentTime={() => {
            setIsLive(true);
            syncToCurrentLive();
          }}
        />

        {/* 4 Priority Core Cards (Matches user screenshots) */}
        <PriorityCardsGrid
          calculatedTimes={coreCalculatedTimes}
          onSelectBase={handleSelectRefLocation}
          title="Priority Core Team Zones"
          subtitle="Bangalore, Philippines, Chicago & Lehi"
          isCoreGroup={true}
        />

        {/* Additional Global Hubs (if any added) */}
        {extraCalculatedTimes.length > 0 && (
          <PriorityCardsGrid
            calculatedTimes={extraCalculatedTimes}
            onSelectBase={handleSelectRefLocation}
            title="Additional Global Hubs"
            subtitle="Secondary team members and locations"
            isCoreGroup={false}
            onRemoveLocation={handleRemoveLocation}
          />
        )}

        {/* Interactive Overlap & 24h Timeline Matrix (12-hour system) */}
        <OverlapTimelineMatrix
          locations={locations}
          refLocationId={refLocationId}
          baseInput={baseInput}
          onSelectHour={handleSelectHourFromMatrix}
        />

        {/* Tabular Offset & Alignment Breakdown */}
        <ComparisonTable
          calculatedTimes={calculatedTimes}
          refLocationCity={refLocation.city}
        />

        {/* Footer */}
        <footer className="pt-6 pb-4 border-t border-white/10 text-center text-xs text-slate-500">
          <p>
            VibeClock · Precision distributed team timezone sync (12-Hour Format) · Built for Bangalore, Philippines, Chicago, and Lehi.
          </p>
        </footer>
      </div>

      {/* Modals */}
      <AddCityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        activeLocations={locations}
        onAddLocation={handleAddLocation}
        onResetToCore={handleResetToCore}
      />

      <MeetingCopyModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        calculatedTimes={calculatedTimes}
        refLocationCity={refLocation.city}
      />
    </div>
  );
}
