"use client";
import Link from 'next/link';

export default function ActionMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      {/* Contenedor del Menú */}
      <div 
        className="w-full max-w-[500px] bg-white rounded-t-[2.5rem] p-8 pb-12 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al tocar dentro
      >
        {/* Barra gris decorativa de arriba */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />

        <h2 className="text-xl font-black italic uppercase text-gray-900 mb-6 text-center">Gestión de Pedidos</h2>

        <div className="grid gap-4">
          {/* OPCIÓN 1: NUEVO */}
          <Link href="/pedidos/nuevo" className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-xl">➕</div>
            <div className="text-left">
              <p className="font-black italic uppercase text-orange-900 text-sm">Crear Pedido</p>
              <p className="text-xs text-orange-700/70 font-bold">Registrar nuevo encargo</p>
            </div>
          </Link>

          {/* OPCIÓN 2: SEGUIMIENTO */}
          <Link href="/pedidos/seguimiento" className="flex items-center gap-4 p-4 bg-gray-900 rounded-2xl active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-xl text-white">📋</div>
            <div className="text-left">
              <p className="font-black italic uppercase text-white text-sm">Ver Pedidos</p>
              <p className="text-xs text-gray-400 font-bold">Panel de seguimiento</p>
            </div>
          </Link>

          <button 
            onClick={onClose}
            className="mt-4 w-full py-4 text-sm font-black uppercase text-gray-400 hover:text-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}