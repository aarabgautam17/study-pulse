import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  CloudRain,
  Disc3,
  Sparkles,
  Music,
} from 'lucide-react';
import { lofiPlayer, LOFI_STATIONS } from '../utils/lofiAudio';

interface LofiPlayerWidgetProps {
  className?: string;
  autoPlayWithTimer?: boolean;
}

export const LofiPlayerWidget: React.FC<LofiPlayerWidgetProps> = ({
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(lofiPlayer.getIsPlaying());
  const [currentStationId, setCurrentStationId] = useState<string>(
    lofiPlayer.getCurrentStation().id
  );
  const [volume, setVolume] = useState<number>(0.45);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showMixer, setShowMixer] = useState<boolean>(false);
  const [rainVolume, setRainVolume] = useState<number>(0.25);
  const [vinylVolume, setVinylVolume] = useState<number>(0.15);

  // Periodically sync isPlaying in case changed elsewhere
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(lofiPlayer.getIsPlaying());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePlay = () => {
    const playing = lofiPlayer.toggle();
    setIsPlaying(playing);
  };

  const handleStationChange = (id: string) => {
    setCurrentStationId(id);
    lofiPlayer.setStation(id);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    lofiPlayer.setVolume(newVol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      lofiPlayer.setVolume(volume);
    } else {
      setIsMuted(true);
      lofiPlayer.setVolume(0);
    }
  };

  const handleRainVolumeChange = (val: number) => {
    setRainVolume(val);
    lofiPlayer.setRainVolume(val);
  };

  const handleVinylVolumeChange = (val: number) => {
    setVinylVolume(val);
    lofiPlayer.setVinylVolume(val);
  };

  const currentStation =
    LOFI_STATIONS.find((s) => s.id === currentStationId) || LOFI_STATIONS[0];

  return (
    <div
      className={`bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-900/50 p-4 shadow-md transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Animated Station Info & Equalizer */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Animated Vinyl / Disc Icon */}
          <div
            className={`relative w-11 h-11 rounded-full bg-slate-800 border-2 border-indigo-400/30 flex items-center justify-center shrink-0 shadow-inner ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '6s' }}
          >
            <Disc3 className="w-6 h-6 text-indigo-300" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
          </div>

          <div className="text-left overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Lo-Fi Beats
              </span>
              {/* Dynamic Equalizer Bars */}
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-3"></span>
                  <span
                    className="w-1 bg-indigo-300 rounded-full animate-pulse h-2"
                    style={{ animationDelay: '150ms' }}
                  ></span>
                  <span
                    className="w-1 bg-indigo-400 rounded-full animate-pulse h-3.5"
                    style={{ animationDelay: '300ms' }}
                  ></span>
                  <span
                    className="w-1 bg-indigo-300 rounded-full animate-pulse h-1.5"
                    style={{ animationDelay: '450ms' }}
                  ></span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">Paused</span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white truncate mt-0.5">
              {currentStation.name}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {currentStation.description}
            </p>
          </div>
        </div>

        {/* Center: Controls (Play/Pause, Stations) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {/* Station dropdown */}
          <div className="relative">
            <select
              value={currentStationId}
              onChange={(e) => handleStationChange(e.target.value)}
              className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 pr-7 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 cursor-pointer appearance-none"
            >
              {LOFI_STATIONS.map((station) => (
                <option key={station.id} value={station.id} className="bg-slate-900 text-white">
                  {station.name} ({station.bpm} BPM)
                </option>
              ))}
            </select>
            <Radio className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Big Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause Lo-Fi Music' : 'Play Lo-Fi Study Music'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-transform active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Lo-Fi</span>
              </>
            )}
          </button>

          {/* Ambient Mixer Toggle */}
          <button
            onClick={() => setShowMixer(!showMixer)}
            title="Adjust Ambient Rain & Vinyl"
            className={`p-2 rounded-xl border transition-colors ${
              showMixer
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Master Volume Slider & Mute Toggle */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/60 rounded-xl px-2.5 py-1.5 border border-slate-700/80">
            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              title="Music Volume"
            />
          </div>
        </div>
      </div>

      {/* Expandable Ambient Sound Mixer Drawer */}
      {showMixer && (
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Rain Sound Slider */}
          <div className="flex items-center gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
            <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Rainfall Ambience</span>
                <span className="font-mono">{Math.round(rainVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={rainVolume}
                onChange={(e) => handleRainVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </div>

          {/* Vinyl Crackle Sound Slider */}
          <div className="flex items-center gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
            <Disc3 className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Vinyl Crackle Texture</span>
                <span className="font-mono">{Math.round(vinylVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={vinylVolume}
                onChange={(e) => handleVinylVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
