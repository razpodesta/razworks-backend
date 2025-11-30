// apps/web-admin/src/components/ui/SystemStatusTicker.tsx
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

type SystemStatusTickerProps = {
  dictionary: Dictionary['system_status'];
  overrideStatus?: 'ONLINE' | 'OFFLINE';
};

export function SystemStatusTicker({ dictionary, overrideStatus }: SystemStatusTickerProps) {
  // Si hay un estado real, lo inyectamos al principio de la lista
  const dynamicItems = overrideStatus
    ? [`🔴 SYSTEM STATUS: ${overrideStatus}`, ...dictionary.items]
    : dictionary.items;

  // Loop x4 para garantizar suavidad en pantallas ultrawide
  const loopedItems = [...dynamicItems, ...dynamicItems, ...dynamicItems, ...dynamicItems];

  const statusColor = overrideStatus === 'OFFLINE' ? 'text-red-500' : 'text-green-500';

  return (
    <div
      className="relative z-40 w-full overflow-hidden border-b border-white/10 bg-[#050505] py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-300 font-sans"
      role="marquee"
      aria-label={dictionary.aria_label}
    >
      {/* Vignetage lateral suave */}
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-[#050505] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-[#050505] to-transparent pointer-events-none" />

      {/* Contenedor Animado */}
      <div
        className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused]"
        style={{ animationDuration: '120s' }} // Muy lento
      >
        {loopedItems.map((item, index) => (
          <div key={index} className="flex items-center mx-10">
            <span className={`mr-3 text-[10px] ${item.includes('OFFLINE') ? 'text-red-500 animate-pulse' : 'text-purple-500'}`}>
              ●
            </span>
            <span className="whitespace-nowrap">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
