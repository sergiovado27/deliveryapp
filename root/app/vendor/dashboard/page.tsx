"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function VendorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [clima, setClima] = useState({ temp: "--", desc: "Cargando...", icono: "⏳" });
  // Nuevo estado para guardar la cantidad de productos
  const [totalArticulos, setTotalArticulos] = useState<number>(0);
  const router = useRouter();

  // --- LÓGICA DEL CLIMA ---
  const fetchClima = useCallback(async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
      const lat = 11.7569; // Nandaime
      const lon = -86.0528;
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      const data = await response.json();

      if (data.main && data.weather) {
        const iconos: { [key: string]: string } = {
          "Clear": "☀️", "Clouds": "☁️", "Rain": "🌧️", "Drizzle": "🌦️",
          "Thunderstorm": "⛈️", "Mist": "🌫️"
        };

        setClima({
          temp: Math.round(data.main.temp).toString(),
          desc: data.weather[0].description,
          icono: iconos[data.weather[0].main] || "☀️"
        });
      }
    } catch (error) {
      console.error("Error clima:", error);
    }
  }, []);

  // --- NUEVA FUNCIÓN PARA CONTAR ARTÍCULOS ---
  const fetchTotalArticulos = useCallback(async (businessId: string) => {
    const { count, error } = await supabase
      .from('menu_items') // Usamos tu tabla existente
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId); // Filtramos por el negocio

    if (!error && count !== null) {
      setTotalArticulos(count);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*') // Aquí cargará business_name y business_id
          .eq('id', authUser.id)
          .single();
        
        setUser(profile);

        // Si el perfil ya tiene un business_id, cargamos el conteo
        if (profile?.business_id) {
          fetchTotalArticulos(profile.business_id);
        }
      }
      fetchClima();
    };
    loadData();
    const interval = setInterval(fetchClima, 120000);
    return () => clearInterval(interval);
  }, [fetchClima, fetchTotalArticulos]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6 mt-8">
        
        {/* Header con Nombre de Negocio y Propietario */}
        <header className="flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex flex-col text-left">
            <h1 className="text-xl font-black italic text-gray-900 leading-tight uppercase">
              {user?.business_name || 'Mi Negocio'}
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              {user?.full_name || 'Propietario'}, Nandaime
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black border border-blue-100 shadow-inner">
            {user?.full_name?.substring(0, 2).toUpperCase() || 'VN'}
          </div>
        </header>

        {/* Card de Clima y Bienvenida */}
        <section className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden flex justify-between items-center">
          <div className="relative z-10 text-left">
           <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.1em] mt-1">Panel de Vendedor</p>
            <h2 className="text-2xl font-black">HOLA, {user?.full_name?.split(' ')[0].toUpperCase()}</h2>
            <h1 className="text-lg-100 text-sm mt-1">¿Qué vamos a gestionar hoy?</h1>
          </div>

          <div className="relative z-10 text-right min-w-[90px]">
            <span className="text-3xl block drop-shadow-md">{clima.icono}</span>
            <p className="text-[9px] font-black uppercase opacity-80 truncate w-24 ml-auto leading-tight">{clima.desc}</p>
            <p className="text-xl font-black tracking-tighter">{clima.temp}°C</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-500 rounded-full opacity-40"></div>
        </section>

        {/* Acciones principales del Vendor */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => router.push('/vendor/inventario')} // Ruta hacia el inventario
          className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left active:scale-95 transition-all">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mb-3">📦</div>
            {/* Ahora muestra el total real de ese negocio */}
            <p className="text-sm font-black uppercase text-gray-800">Mi Inventario</p>
            <p className="text-[10px] font-black uppercase text-orange-400">Total: {totalArticulos}</p>
          </button>

          <button className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left active:scale-95 transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mb-3">📋</div>
            <p className="text-sm font-black uppercase text-gray-800">Órdenes</p>
            <p className="text-[10px] font-black uppercase text-green-400">Pendientes: 0</p>
          </button>
        </div>

        {/* Footer de Estado */}
        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className="w-full bg-white text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-gray-100 active:scale-95 transition-transform"
        >
          Cerrar Sesión
        </button>
      </div>
    </main>
  );
}