// RUTA: apps/web-admin/src/components/ui/VisitorHud.tsx
// VERSIÓN: 13.0 - Semantic Glassmorphism & Simulation Mode
// AUTOR: Raz Podestá - MetaShark Tech
// DESCRIPCIÓN: Widget flotante que muestra información contextual del visitante (Geo + Clima).
//              Adaptado para modo claro/oscuro usando 'bg-card' semántico y efectos de vidrio.
//              Gestionado por Zustand para persistencia de estado.

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
  MapPin, CloudSun, CloudRain, Cloud, Sun, Clock,
  Loader, AlertCircle, X, Info, ScanFace,
} from 'lucide-react';
import { useVisitorData } from '../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../lib/store/ui.store';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

const WIDGET_POSITION_KEY = 'visitorWidgetPosition';

// Utilidad para formatear coordenadas de manera "técnica"
function decimalToDMS(decimal: number, type: 'lat' | 'lon'): string {
    if (!decimal) return '--';
    const absDecimal = Math.abs(decimal);
    const degrees = Math.floor(absDecimal);
    const minutes = Math.floor((absDecimal - degrees) * 60);
    const direction = type === 'lat' ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}' ${direction}`;
}

// Determinación del icono y color del clima
function getWeatherStatus(code: number) {
  if (code <= 3) return { type: 'sunny', icon: Sun };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { type: 'rainy', icon: CloudRain };
  return { type: 'cloudy', icon: Cloud };
}

type VisitorHudProps = {
  dictionary: Dictionary['visitor_hud'] | undefined;
};

export function VisitorHud({ dictionary }: VisitorHudProps) {
  // 1. HOOKS DE DATOS
  const { data, isLoading, error } = useVisitorData();
  const [currentTime, setCurrentTime] = useState('--:--');

  // 2. ESTADO GLOBAL (ZUSTAND)
  const isVisitorHudOpen = useUIStore((state) => state.isVisitorHudOpen);
  const closeVisitorHud = useUIStore((state) => state.closeVisitorHud);

  // 3. MOTION VALUES PARA DRAG & DROP
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Cálculo memoizado del estado del clima para UI
  const weatherInfo = useMemo(() => {
    // Estado por defecto
    if (!data?.weather) return { label: '...', icon: CloudSun, color: 'text-muted-foreground' };

    const status = getWeatherStatus(data.weather.weathercode);
    let label = '';
    let color = '';

    if (dictionary) {
      if (status.type === 'sunny') { label = dictionary.weather_sunny; color = 'text-yellow-500 dark:text-yellow-400'; }
      else if (status.type === 'rainy') { label = dictionary.weather_rainy; color = 'text-blue-500 dark:text-blue-400'; }
      else { label = dictionary.weather_cloudy; color = 'text-muted-foreground'; }
    }
    return { label, icon: status.icon, color };
  }, [data, dictionary]);

  // Auto-ocultar al hacer scroll (UX Defense)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100 && isVisitorHudOpen) {
        closeVisitorHud();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisitorHudOpen, closeVisitorHud]);

  // Restaurar posición guardada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPosition = localStorage.getItem(WIDGET_POSITION_KEY);
      if (storedPosition) {
        try {
          const { x: savedX, y: savedY } = JSON.parse(storedPosition);
          x.set(savedX);
          y.set(savedY);
        } catch (e) { console.error(e); }
      }
    }
  }, [x, y]);

  // Reloj en tiempo real ajustado a la zona horaria del visitante
  useEffect(() => {
    if (!data?.timezone) return;
    const updateClock = () => {
      const timeString = new Date().toLocaleTimeString('en-GB', {
        timeZone: data.timezone,
        hour: '2-digit', minute: '2-digit'
      });
      setCurrentTime(timeString);
    };
    const rafId = requestAnimationFrame(updateClock);
    const timerId = setInterval(updateClock, 1000);
    return () => { cancelAnimationFrame(rafId); clearInterval(timerId); };
  }, [data?.timezone]);

  function handleDragEnd() {
    const newPosition = { x: x.get(), y: y.get() };
    localStorage.setItem(WIDGET_POSITION_KEY, JSON.stringify(newPosition));
  }

  // Guardián de renderizado: Si no hay diccionario, no mostramos nada.
  if (!dictionary) return null;

  return (
    <AnimatePresence>
      {isVisitorHudOpen && (
        <motion.div
          drag
          onDragEnd={handleDragEnd}
          style={{ x, y }}
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
          // THEMED: bg-card con opacidad alta para asegurar legibilidad sobre cualquier fondo
          className="fixed top-24 right-4 z-40 w-72 cursor-grab rounded-xl border border-border bg-card/95 p-0 text-card-foreground shadow-xl shadow-black/20 backdrop-blur-md active:cursor-grabbing sm:top-28 overflow-hidden"
        >
          {/* Header del Widget */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2 text-primary">
              <ScanFace size={16} />
              <span className="font-display text-[10px] font-bold tracking-[0.15em] uppercase">
                {dictionary.label_visitor_info}
              </span>
            </div>
            <button
              onClick={closeVisitorHud}
              className="p-1 rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
              aria-label="Cerrar widget"
            >
              <X size={14} />
            </button>
          </div>

          {/* Contenido del Widget */}
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader size={20} className="animate-spin text-primary" />
                <span className="font-mono text-[10px] animate-pulse text-muted-foreground">{dictionary.status_calibrating}</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center gap-2 text-destructive py-2">
                <AlertCircle size={16} /> <span className="text-xs font-bold">{dictionary.status_error}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MapPin size={10} /> {dictionary.label_location}
                        </p>
                        <p className="font-bold text-sm truncate text-foreground" title={data?.city}>{data?.city}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
                           {dictionary.label_time} <Clock size={10} />
                        </p>
                        <p className="font-mono font-bold text-foreground text-sm">{currentTime}</p>
                    </div>
                </div>

                <div className="h-px bg-border w-full" />

                <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-3">
                         <weatherInfo.icon size={24} className={weatherInfo.color} />
                         <div>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase">{weatherInfo.label}</p>
                             <p className="text-sm font-bold text-foreground">{data?.weather.temperature}°C</p>
                         </div>
                    </div>
                    <div className="text-right">
                         <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{dictionary.coords_format}</p>
                         <p className="font-mono text-[10px] text-muted-foreground/80">
                            {decimalToDMS(data?.coordinates.latitude || 0, 'lat')}
                         </p>
                         <p className="font-mono text-[10px] text-muted-foreground/80">
                            {decimalToDMS(data?.coordinates.longitude || 0, 'lon')}
                         </p>
                    </div>
                </div>

                {/* IP Box */}
                <div className="bg-muted/50 rounded-lg p-2 text-center border border-border/50">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] mb-1">{dictionary.label_ip_visitor}</p>
                    <p className="font-mono text-xs text-primary font-bold tracking-wide">{data?.ip}</p>
                </div>
              </>
            )}
          </div>

          {/* Footer del Widget */}
          <div className="bg-muted/30 border-t border-border py-2 px-4 text-center">
              <p className="text-[8px] text-muted-foreground/70 font-medium flex items-center justify-center gap-1">
                 <Info size={8} /> {dictionary.footer_credits}
              </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
