import { StatusBadge } from '@razworks/ui';

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">
          RazWorks Admin
        </h1>
        <p className="text-gray-500 mb-8">
          Prueba de integración de Workspaces (Render & Vercel)
        </p>

        <div className="flex justify-center">
          <StatusBadge status="ONLINE" />
        </div>

        <div className="mt-8 text-xs text-gray-400 font-mono">
          app: web-admin | lib: @razworks/ui
        </div>
      </div>
    </div>
  );
}
