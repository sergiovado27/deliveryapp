"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PedidosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Contenedor Principal (Ya no es un modal, es la página) */}
      <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        
        {/* Barra decorativa */}
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />

        <h2 className="text-xl font-black italic uppercase text-gray-900 mb-8 text-center tracking-tighter">
          Gestión de Pedidos
        </h2>

        <div className="grid gap-4">
          {/* OPCIÓN 1: NUEVO */}
          <Link href="/pedidos/nuevo" className="flex items-center gap-4 p-5 bg-orange-50 rounded-3xl border border-orange-100 active:scale-95 transition-all group">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform">
              ➕
            </div>
            <div className="text-left">
              <p className="font-black italic uppercase text-orange-900 text-sm leading-none">Crear Pedido</p>
              <p className="text-[10px] text-orange-700/60 font-bold uppercase mt-1 tracking-wider">Registrar nuevo encargo</p>
            </div>
          </Link>

          {/* OPCIÓN 2: SEGUIMIENTO */}
          <Link href="/pedidos/seguimiento" className="flex items-center gap-4 p-5 bg-gray-900 rounded-3xl active:scale-95 transition-all group shadow-xl shadow-gray-200">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl text-white group-hover:-rotate-12 transition-transform">
              📋
            </div>
            <div className="text-left">
              <p className="font-black italic uppercase text-white text-sm leading-none">Ver Pedidos</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Panel de seguimiento</p>
            </div>
          </Link>

          {/* BOTÓN VOLVER */}
          <button 
            onClick={() => router.back()}
            className="mt-6 w-full py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-[0.2em] transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}