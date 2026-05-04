"use client";
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// --- NUEVO COMPONENTE: ACTION MENU (DESDE ABAJO) ---
function ActionMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-[450px] bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        <h2 className="text-xl font-black italic uppercase text-gray-900 mb-6 text-center">Gestión de Pedidos</h2>

        <div className="grid gap-4">
          {/* OPCIÓN 1: NUEVO */}
          <Link href="/pedidos/nuevo" className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-200">➕</div>
            <div className="text-left">
              <p className="font-black italic uppercase text-orange-900 text-sm">Crear Pedido</p>
              <p className="text-xs text-orange-700/70 font-bold uppercase tracking-tight">Registrar nuevo encargo</p>
            </div>
          </Link>

          {/* OPCIÓN 2: SEGUIMIENTO */}
          <Link href="/pedidos/seguimiento" className="flex items-center gap-4 p-4 bg-gray-900 rounded-2xl active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-xl text-white shadow-xl">📋</div>
            <div className="text-left">
              <p className="font-black italic uppercase text-white text-sm">Ver Pedidos</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tight text-[10px]">Mira todos los pedidos creados</p>
            </div>
          </Link>

          <button onClick={onClose} className="mt-4 w-full py-2 text-xs font-black uppercase text-gray-400">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [clima, setClima] = useState({ temp: "--", desc: "Cargando...", icono: "⏳" });
  // ESTADO PARA EL MENÚ
  const [showPedidoMenu, setShowPedidoMenu] = useState(false);

  const fetchClima = useCallback(async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
      const lat = 11.7569; // Nandaime
      const lon = -86.0528;
      
      if (!API_KEY) {
        setClima(prev => ({ ...prev, desc: "Falta API Key" }));
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      
      const data = await response.json();

      if (data.main && data.weather) {
        const iconos: { [key: string]: string } = {
          "Clear": "☀️", "Clouds": "☁️", "Rain": "🌧️", "Drizzle": "🌦️",
          "Thunderstorm": "⛈️", "Mist": "🌫️", "Haze": "🌫️", "Fog": "🌫️"
        };

        setClima({
          temp: Math.round(data.main.temp).toString(),
          desc: data.weather[0].description,
          icono: iconos[data.weather[0].main] || "☀️"
        });
      }
    } catch (error) {
      console.error("Error obteniendo el clima:", error);
      setClima(prev => ({ ...prev, desc: "Sin conexión" }));
    }
  }, []);

  useEffect(() => {
    fetchClima();
    const interval = setInterval(fetchClima, 120000);
    return () => clearInterval(interval);
  }, [fetchClima]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6 mt-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800">MonchoXpress</h1>
            <p className="text-xs text-orange-500 font-semibold">Panel Superadmin</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm">
            SV
          </div>
        </header>

        {/* Sección de Bienvenida */}
        <section className="space-y-4">
          <div className="bg-orange-500 p-6 rounded-[2rem] text-white shadow-lg shadow-orange-200 relative overflow-hidden flex justify-between items-center">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold">Hola, Sergio</h2>
              <p className="text-orange-100 text-sm mt-1">¿Qué vamos a gestionar hoy?</p>
            </div>

            <div className="relative z-10 text-right min-w-[90px]">
              <span className="text-3xl block drop-shadow-md">{clima.icono}</span>
              <p className="text-[10px] font-bold uppercase opacity-90 truncate w-24 ml-auto leading-tight">{clima.desc}</p>
              <p className="text-xl font-bold tracking-tighter">{clima.temp}°C</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-400 rounded-full opacity-50"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* BOTÓN PEDIDOS CON FUNCIÓN */}
            <button 
              onClick={() => setShowPedidoMenu(true)}
              className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform text-left"
            >
              <span className="text-2xl">📦</span>
              <p className="text-sm font-bold text-gray-700 mt-2">Pedidos</p>
            </button>

            <Link href="/gestion-menu" className="w-full">
              <button className=" w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform text-left">
                <span className="text-2xl">🍔</span>
                <p className="text-sm font-bold text-gray-700 mt-2">Menú</p>
              </button>
            </Link>
          </div>
        </section>

        {/* Accesos Rápidos */}
        <Link href="/registro-rider" className="block">
          <button className="w-full bg-gray-900 text-white p-5 rounded-3xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl bg-gray-800 p-2 rounded-xl">🛵</span>
              <div className="text-left">
                <p className="text-base">Gestionar FatRiders</p>
                <p className="text-gray-400 text-[10px] font-normal uppercase tracking-wider">Dar de Alta • Editar • Dar de Baja</p>
              </div>
            </div>
            <span className="text-xl text-orange-500">→</span>
          </button>
        </Link>

        <Link href="/registro-negocio" className="block">
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

        <button className="w-full bg-white text-gray-500 py-3 rounded-2xl text-sm font-medium border border-gray-100 active:scale-95 transition-transform">
          Configurar Usuarios
        </button>
      </div>

      {/* RENDERIZAR EL MENÚ AQUÍ ABAJO */}
      <ActionMenu isOpen={showPedidoMenu} onClose={() => setShowPedidoMenu(false)} />
    </main>
  );
}