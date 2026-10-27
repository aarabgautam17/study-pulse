/**
 * Generative Lo-Fi Music & Ambient Player using Web Audio API.
 * Synthesizes mellow 7th/9th electric piano chords, subtle boom-bap rhythm,
 * authentic vinyl crackle, and soothing rain textures.
 * 100% offline, zero external streaming dependencies.
 */

export interface LofiStation {
  id: string;
  name: string;
  description: string;
  bpm: number;
  chords: number[][]; // MIDI-style frequencies
}

// Frequency helpers (Hz)
const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25,
  Eb3: 155.56, Fs3: 185.00, Ab3: 207.65, Bb3: 233.08,
  Eb4: 311.13, Fs4: 369.99, Ab4: 415.30, Bb4: 466.16,
};

export const LOFI_STATIONS: LofiStation[] = [
  {
    id: 'midnight',
    name: 'Midnight Study Beats',
    description: 'Warm Rhodes electric piano with mellow jazz chords',
    bpm: 72,
    chords: [
      // Dm9
      [NOTES.D3, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5],
      // G13
      [NOTES.G3, NOTES.F4, NOTES.B4, NOTES.E5],
      // Cmaj7
      [NOTES.C3, NOTES.E4, NOTES.G4, NOTES.B4, NOTES.D5],
      // Am7
      [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.G4],
    ],
  },
  {
    id: 'rainy',
    name: 'Rainy Window Chords',
    description: 'Gentle, contemplative minor chords with soft raindrops',
    bpm: 68,
    chords: [
      // Fmaj7
      [NOTES.F3, NOTES.A4, NOTES.C5, NOTES.E5],
      // Em7
      [NOTES.E3, NOTES.G4, NOTES.B4, NOTES.D5],
      // Dm7
      [NOTES.D3, NOTES.F4, NOTES.A4, NOTES.C5],
      // Cmaj7
      [NOTES.C3, NOTES.E4, NOTES.G4, NOTES.B4],
    ],
  },
  {
    id: 'coffee',
    name: 'Cafe Vinyl Chill',
    description: 'Laid-back boom-bap swing with nostalgic vinyl warmth',
    bpm: 76,
    chords: [
      // Em9
      [NOTES.E3, NOTES.G4, NOTES.B4, NOTES.D5, NOTES.Fs4],
      // A13
      [NOTES.A3, NOTES.G4, NOTES.C5, NOTES.Fs4],
      // Dmaj9
      [NOTES.D3, NOTES.Fs4, NOTES.A4, NOTES.C5, NOTES.E5],
      // Bm7
      [NOTES.B3, NOTES.D4, NOTES.Fs4, NOTES.A4],
    ],
  },
  {
    id: 'cosmic',
    name: 'Cosmic Focus Drift',
    description: 'Spacious ambient pads for deep cognitive flow',
    bpm: 64,
    chords: [
      // Abmaj7
      [NOTES.Ab3, NOTES.C4, NOTES.Eb4, NOTES.G4],
      // Gm7
      [NOTES.G3, NOTES.Bb3, NOTES.D4, NOTES.F4],
      // Fm7
      [NOTES.F3, NOTES.Ab3, NOTES.C4, NOTES.Eb4],
      // Ebmaj7
      [NOTES.Eb3, NOTES.G3, NOTES.Bb3, NOTES.D4],
    ],
  },
];

class LofiPlayerEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentStationIndex = 0;
  private volume = 0.45;
  private rainVolume = 0.25;
  private vinylVolume = 0.15;

  private masterGain: GainNode | null = null;
  private chordsGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;

  private schedulerTimer: number | null = null;
  private currentStep = 0;
  private chordIndex = 0;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Chords Gain Node
      this.chordsGain = this.ctx.createGain();
      this.chordsGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.chordsGain.connect(this.masterGain);

      // Rain Gain Node
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(this.rainVolume, this.ctx.currentTime);
      this.rainGain.connect(this.masterGain);

      // Vinyl Gain Node
      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(this.vinylVolume, this.ctx.currentTime);
      this.vinylGain.connect(this.masterGain);

      this.startAmbientTextures();
    }
  }

  // Generates soothing pink noise for rain and vinyl background
  private startAmbientTextures() {
    if (!this.ctx || !this.rainGain || !this.vinylGain) return;

    // Buffer of pink noise (5 seconds loop)
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    // 1. Rain Source
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    // Filter rain to sound like distant soothing rainfall
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(900, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    rainSource.start();

    // 2. Vinyl Crackle Source
    const vinylSource = this.ctx.createBufferSource();
    vinylSource.buffer = noiseBuffer;
    vinylSource.loop = true;

    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    vinylFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    vinylSource.connect(vinylFilter);
    vinylFilter.connect(this.vinylGain);
    vinylSource.start();
  }

  // Play a soft lo-fi chord
  private playChord(freqs: number[], durationSecs: number) {
    if (!this.ctx || !this.chordsGain) return;
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      // Mellow triangle wave with subtle sine undertone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.002, now); // subtle chorus/detune for warmth

      // Warm low-pass filter (classic lo-fi tone)
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 200, now);

      // Smooth Rhodes-style envelope (gentle attack, slow warm decay)
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.15 + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSecs * 0.95);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.chordsGain!);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + durationSecs);
      osc2.stop(now + durationSecs);
    });
  }

  // Soft lo-fi kick drum
  private playKick() {
    if (!this.ctx || !this.chordsGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Soft lo-fi brush snare
  private playSnare() {
    if (!this.ctx || !this.chordsGain) return;
    const now = this.ctx.currentTime;

    // Filtered noise pop
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    noise.start(now);
  }

  // Gentle soft hi-hat
  private playHiHat() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // Beat loop sequencer
  private startSequencer() {
    const station = LOFI_STATIONS[this.currentStationIndex];
    const beatIntervalMs = (60 / station.bpm) * 1000;

    this.schedulerTimer = window.setInterval(() => {
      if (!this.isPlaying) return;

      // Every 8 beats = 1 chord
      if (this.currentStep % 8 === 0) {
        const chord = station.chords[this.chordIndex];
        this.playChord(chord, (beatIntervalMs * 7.5) / 1000);
        this.chordIndex = (this.chordIndex + 1) % station.chords.length;
      }

      // Drum groove: Kick on 0, 4; Snare on 2, 6; Soft Hihat every beat
      const beatInBar = this.currentStep % 4;
      if (beatInBar === 0) {
        this.playKick();
      } else if (beatInBar === 2) {
        this.playSnare();
      }
      this.playHiHat();

      this.currentStep = (this.currentStep + 1) % 32;
    }, beatIntervalMs / 2); // 8th note resolution
  }

  public play() {
    this.init();
    if (this.isPlaying) return;

    this.isPlaying = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.startSequencer();
  }

  public pause() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public setStation(stationId: string) {
    const idx = LOFI_STATIONS.findIndex((s) => s.id === stationId);
    if (idx !== -1) {
      this.currentStationIndex = idx;
      this.currentStep = 0;
      this.chordIndex = 0;
      if (this.isPlaying) {
        // Restart sequencer with new BPM and chords
        if (this.schedulerTimer) clearInterval(this.schedulerTimer);
        this.startSequencer();
      }
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setRainVolume(val: number) {
    this.rainVolume = Math.max(0, Math.min(1, val));
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setValueAtTime(this.rainVolume, this.ctx.currentTime);
    }
  }

  public setVinylVolume(val: number) {
    this.vinylVolume = Math.max(0, Math.min(1, val));
    if (this.vinylGain && this.ctx) {
      this.vinylGain.gain.setValueAtTime(this.vinylVolume, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentStation(): LofiStation {
    return LOFI_STATIONS[this.currentStationIndex];
  }
}

export const lofiPlayer = new LofiPlayerEngine();
