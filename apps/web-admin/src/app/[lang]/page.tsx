// apps/web-admin/src/app/[lang]/page.tsx
import { Suspense } from 'react';
import { getDictionary } from '@/lib/get-dictionary';
import { type Locale } from '@/config/i18n.config';
import { Activity, Server, Users, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getSystemStatus } from '../actions/system.actions';

// --- COMPONENTS ---
import { SystemStatusTicker } from '../../components/ui/SystemStatusTicker';

export default async function DashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // FETCH DE DATOS REALES (Server-Side)
  // Esto ocurre en el servidor antes de enviar HTML al navegador
  const { health, isConnected } = await getSystemStatus();

  const statusColor = isConnected
    ? (health.status === 'ok' ? 'text-green-500' : 'text-yellow-500')
    : 'text-red-500';

  return (
    <div className="container mx-auto p-6 space-y-8">

      {/* 1. Ticker de Estado Global */}
      <SystemStatusTicker
        dictionary={dict.system_status}
        overrideStatus={isConnected ? 'ONLINE' : 'OFFLINE'}
      />

      {/* 2. Encabezado */}
      <div className="flex flex-col gap-2 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          {dict.dashboard.welcome_title}
          {!isConnected && (
            <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded border border-red-800">
              OFFLINE MODE
            </span>
          )}
        </h1>
        <p className="text-zinc-400">
          {dict.dashboard.welcome_subtitle} | Core v{health.version}
        </p>
      </div>

      {/* 3. Métricas Vivas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {/* Card 1: Estado del Backend */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-zinc-950 border border-zinc-800 ${statusColor}`}>
              {isConnected ? <Server size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">{dict.dashboard.stats.system_status}</p>
              <h3 className={`text-2xl font-bold ${statusColor} uppercase`}>
                {health.status}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                {health.timestamp.split('T')[1]?.split('.')[0] || '--:--:--'} UTC
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Seguridad (HMAC) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Security Protocol</p>
              <h3 className="text-2xl font-bold text-white">AEAD-256</h3>
              <p className="text-xs text-zinc-500 font-mono mt-1">HMAC Signed Requests</p>
            </div>
          </div>
        </div>

        {/* Card 3: Usuarios (Placeholder/Mock por ahora) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">{dict.dashboard.stats.active_users}</p>
              <h3 className="text-2xl font-bold text-white">--</h3>
              <p className="text-xs text-zinc-500 font-mono mt-1">Real-time Sync Pending</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
