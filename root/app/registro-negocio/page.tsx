"use client";
import Link from "next/link";

export default function MenuNegocios() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[400px] mx-auto space-y-6 mt-8">
        <header className="flex items-center gap-4">
          <Link href="/" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Gestionar Negocios</h1>
        </header>

        <div className="flex flex-col gap-4">
          {/* Opción 1: Agregar */}
          <Link href="/registro-negocio/nuevo">
            <button className="w-full bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-all">
              <span className="text-3xl">➕</span>
              <div className="text-left">
                <p className="font-bold text-gray-800">Agregar nuevo negocio</p>
                <p className="text-xs text-gray-400">Registrar un comercio desde cero</p>
              </div>
            </button>
          </Link>

          {/* Opción 2: Editar */}
          <Link href="/registro-negocio/editar">
            <button className="w-full bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-all">
              <span className="text-3xl">✏️</span>
              <div className="text-left">
                <p className="font-bold text-gray-800">Editar un negocio</p>
                <p className="text-xs text-gray-400">Modificar datos existentes</p>
              </div>
            </button>
          </Link>

          {/* Opción 3: Dar de Baja */}
          <Link href="/registro-negocio/baja">
            <button className="w-full bg-white p-6 rounded-[2rem] shadow-sm border border-red-50 flex items-center gap-4 active:scale-95 transition-all">
              <span className="text-3xl">🚫</span>
              <div className="text-left">
                <p className="font-bold text-red-600">Dar de baja un negocio</p>
                <p className="text-xs text-gray-400">Desactivar comercio del sistema</p>
              </div>
            </button>
          </Link>
          <Link href="/registro-negocio/ver" className="flex items-center gap-4 p-6 bg-white rounded-[2rem] shadow-sm border border-gray-50">
    <span className="text-3xl">🏬</span>
    <div>
      <h3 className="font-bold text-gray-800">Ver negocios</h3>
      <p className="text-xs text-gray-400">Editar, dar de alta o baja y ver historial</p>
    </div>
  </Link>
        </div>
      </div>
    </main>
  );
}