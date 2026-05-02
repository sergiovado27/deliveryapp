import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6 mt-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800">FatDelivery</h1>
            <p className="text-xs text-orange-500 font-semibold">Panel Superadmin</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm">
            SV
          </div>
        </header>

        {/* Sección de Bienvenida */}
        <section className="space-y-4">
          <div className="bg-orange-500 p-6 rounded-[2rem] text-white shadow-lg shadow-orange-200 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold">Hola, Sergio</h2>
              <p className="text-orange-100 text-sm mt-1">¿Qué vamos a gestionar hoy?</p>
            </div>
            {/* Decoración abstracta para que no sea solo un color plano */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-400 rounded-full opacity-50"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform text-left">
              <span className="text-2xl">📦</span>
              <p className="text-sm font-bold text-gray-700 mt-2">Pedidos</p>
            </button>
            <button className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform text-left">
              <span className="text-2xl">🍔</span>
              <p className="text-sm font-bold text-gray-700 mt-2">Menú</p>
            </button>
          </div>
        </section>

        {/* Nueva Opción: Agregar FatRider */}
        <Link href="/registro-rider" className="block">
          <button className="w-full bg-gray-900 text-white p-5 rounded-3xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl bg-gray-800 p-2 rounded-xl">🛵</span>
              <div className="text-left">
                <p className="text-base">Agregar FatRider</p>
                <p className="text-gray-400 text-[10px] font-normal uppercase tracking-wider">Nuevo ingreso</p>
              </div>
            </div>
            <span className="text-xl text-orange-500">→</span>
          </button>
        </Link>

<Link href="/registro-negocio" className="block mt-4">
  <button className="w-full bg-white text-gray-800 p-5 rounded-3xl font-bold shadow-md border border-gray-100 active:scale-95 transition-all flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-2xl bg-orange-100 p-2 rounded-xl">🏪</span>
      <div className="text-left">
        <p className="text-base text-gray-900">Gestionar Negocios</p>
        <p className="text-gray-400 text-[10px] font-normal uppercase tracking-wider">Crear • Editar • Baja</p>
      </div>
    </div>
    <span className="text-xl text-orange-500">→</span>
  </button>
</Link>
        {/* Botón secundario */}
        <button className="w-full bg-white text-gray-500 py-3 rounded-2xl text-sm font-medium border border-gray-100 active:scale-95 transition-transform">
          Configurar Usuarios
        </button>

      </div>
    </main>
  );
}