"use client";
import Link from "next/link";

export default function GestionRidersMenu() {
  const menuOptions = [
    {
      title: "Agregar nuevo FatRider",
      subtitle: "Registrar un conductor desde cero",
      icon: "➕",
      href: "/registro-rider/nuevo",
      color: "text-purple-600"
    },
    {
      title: "Editar un FatRider",
      subtitle: "Modificar datos existentes",
      icon: "✏️",
      href: "/registro-rider/lista", // Reutilizaremos la lista para seleccionar cuál editar
      color: "text-orange-500"
    },
    {
      title: "Dar de baja un FatRider",
      subtitle: "Desactivar conductor del sistema",
      icon: "🚫",
      href: "/registro-rider/lista",
      color: "text-red-500"
    },
    {
      title: "Ver FatRiders",
      subtitle: "Editar, dar de alta o baja y ver historial",
      icon: "🛵",
      href: "/registro-rider/lista",
      color: "text-blue-600"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[450px] mx-auto space-y-6">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Gestionar FatRiders</h1>
        </header>

        <div className="grid gap-4">
          {menuOptions.map((option, index) => (
            <Link 
              key={index} 
              href={option.href}
              className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-white flex items-center gap-5 active:scale-95 transition-all"
            >
              <div className="text-3xl bg-gray-50 w-14 h-14 flex items-center justify-center rounded-2xl">
                {option.icon}
              </div>
              <div className="text-left">
                <h3 className={`font-bold ${option.color}`}>{option.title}</h3>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                  {option.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}