/**
 * PhoneDemo - Interactive animated demo of ManoProtect app flow
 * Shows: Request location → Searching → Map appears → SOS alert
 * Pure CSS/JS animation - no video files needed
 */
import { useState, useEffect, useRef } from 'react';
import { MapPin, Shield, Bell, Navigation, ChevronRight } from 'lucide-react';

const STEPS = [
  { id: 'idle', duration: 2000 },
  { id: 'tap', duration: 800 },
  { id: 'searching', duration: 2500 },
  { id: 'found', duration: 3000 },
  { id: 'alert', duration: 3500 },
];
const TOTAL = STEPS.reduce((s, x) => s + x.duration, 0);

const PhoneDemo = () => {
  const [phase, setPhase] = useState('idle');
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  // Start animation when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const runCycle = () => {
      let delay = 0;
      STEPS.forEach(step => {
        const t = setTimeout(() => setPhase(step.id), delay);
        timerRef.current = t;
        delay += step.duration;
      });
      // Loop
      const loop = setTimeout(runCycle, TOTAL + 500);
      timerRef.current = loop;
    };

    runCycle();
    return () => clearTimeout(timerRef.current);
  }, [visible]);

  return (
    <div ref={ref} className="relative" data-testid="phone-demo">
      {/* Phone frame */}
      <div className="relative mx-auto w-[260px] sm:w-[280px]">
        {/* Phone shell */}
        <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-gray-400/30">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />

          {/* Screen */}
          <div className="relative bg-white rounded-[2rem] overflow-hidden" style={{ aspectRatio: '9/17.5' }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-8 pb-2 bg-emerald-500">
              <span className="text-white text-[10px] font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-2 border border-white rounded-sm relative">
                  <div className="absolute inset-0.5 bg-white rounded-[1px]" style={{ width: '75%' }} />
                </div>
              </div>
            </div>

            {/* App header */}
            <div className="bg-emerald-500 px-4 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold">ManoProtect</span>
            </div>

            {/* Screen content */}
            <div className="relative h-full">
              {/* ── PHASE: IDLE / TAP ── */}
              <div className={`absolute inset-0 px-4 pt-4 transition-all duration-500 ${
                phase === 'idle' || phase === 'tap' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                {/* Family member card */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 text-xs font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">Alejandro</p>
                      <p className="text-[9px] text-gray-400">Hijo - 15 a&ntilde;os</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-[9px] text-emerald-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>

                {/* Location request button */}
                <button
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    phase === 'tap'
                      ? 'bg-emerald-600 scale-95 shadow-inner'
                      : 'bg-emerald-500 shadow-lg shadow-emerald-200'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white">Solicitar ubicaci&oacute;n</span>
                </button>

                {/* Tap ripple */}
                {phase === 'tap' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-emerald-300/30 rounded-full animate-ping" />
                  </div>
                )}

                {/* SOS button */}
                <div className="mt-4 flex items-center justify-between bg-red-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                      <Bell className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold text-red-600">Bot&oacute;n SOS</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-red-400" />
                </div>
              </div>

              {/* ── PHASE: SEARCHING ── */}
              <div className={`absolute inset-0 px-4 pt-4 flex flex-col items-center justify-start transition-all duration-500 ${
                phase === 'searching' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <p className="text-[11px] text-gray-500 font-medium mb-4 mt-2">Buscando a Alejandro...</p>
                {/* Radar pulse */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                  <div className="absolute inset-3 bg-emerald-100 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }} />
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg shadow-emerald-200">
                    <Navigation className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '2s' }} />
                  </div>
                </div>
                <p className="text-[10px] text-emerald-500 font-semibold mt-4 animate-pulse">Localizando GPS...</p>
              </div>

              {/* ── PHASE: FOUND (MAP) ── */}
              <div className={`absolute inset-0 transition-all duration-700 ${
                phase === 'found' || phase === 'alert' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}>
                {/* Simplified map */}
                <div className="relative w-full h-full bg-emerald-50/50">
                  {/* Map grid lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#10b981" strokeWidth="0.5"/></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                  </svg>

                  {/* Street lines */}
                  <div className="absolute top-1/3 left-0 right-0 h-[3px] bg-gray-200" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-[3px] bg-gray-200" />
                  <div className="absolute top-2/3 left-0 right-0 h-[2px] bg-gray-200 opacity-60" />
                  <div className="absolute top-0 bottom-0 right-1/4 w-[2px] bg-gray-200 opacity-60" />

                  {/* Location pin with bounce */}
                  <div className={`absolute top-[38%] left-[45%] -translate-x-1/2 -translate-y-full z-10 transition-all duration-700 ${
                    phase === 'found' || phase === 'alert' ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                  }`}>
                    <div className="relative">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                        <span className="text-white text-[10px] font-bold">A</span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-500" />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/10 rounded-full blur-sm" />
                    </div>
                  </div>

                  {/* Accuracy circle */}
                  <div className={`absolute top-[38%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-emerald-300/40 bg-emerald-100/20 transition-all duration-1000 ${
                    phase === 'found' || phase === 'alert' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`} />

                  {/* Location info card */}
                  <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-3 transition-all duration-500 ${
                    phase === 'found' || phase === 'alert' ? 'translate-y-0' : 'translate-y-full'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-800">Alejandro localizado</p>
                        <p className="text-[9px] text-gray-400">Calle Mayor 12, Madrid Centro</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      Hace 3 segundos - Precisi&oacute;n: 8m
                    </div>
                  </div>
                </div>
              </div>

              {/* ── PHASE: ALERT NOTIFICATION ── */}
              {phase === 'alert' && (
                <div className="absolute top-10 left-2 right-2 z-20 animate-in slide-in-from-top duration-500">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-800">ManoProtect</p>
                        <p className="text-[9px] text-gray-500 leading-snug">Alejandro est&aacute; en Calle Mayor 12, Madrid. Todo bien.</p>
                      </div>
                      <span className="text-[8px] text-gray-400 flex-shrink-0">ahora</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Glow behind phone */}
        <div className="absolute -inset-8 bg-emerald-200/20 rounded-full blur-3xl -z-10" />
      </div>

      {/* Step indicators below phone */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {['idle', 'searching', 'found', 'alert'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              phase === s || (s === 'idle' && phase === 'tap')
                ? 'bg-emerald-500 scale-125'
                : 'bg-gray-200'
            }`} />
            {i < 3 && <div className="w-4 h-[1px] bg-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhoneDemo;
