"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function RiderDashboard() {
  const [user, setUser] = useState<any>(null);
  const [clima, setClima] = useState({ temp: "--", desc: "Cargando...", icono: "⏳" });
  const [view, setView] = useState<"inicio" | "perfil">("inicio");
  const [ordenesCount, setOrdenesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saludo, setSaludo] = useState("¡Hola!");
  
  // ESTADO DE SERVICIO
  const [status, setStatus] = useState<"disponible" | "desconectado" | "ocupado">("desconectado");

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const router = useRouter();

  // Función para determinar el saludo según la hora
  const obtenerSaludo = useCallback(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const fetchClima = useCallback(async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
      const lat = 11.7569; 
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
    } catch (e) { console.error(e); }
  }, []);

  const loadRiderData = useCallback(async () => {
    setLoading(true);
    setSaludo(obtenerSaludo()); // Actualizar saludo al cargar
    
    const { count } = await supabase
      .from('fat_pedidos')
      .select('*', { count: 'exact', head: true })
      .is('rider_id', null);
    setOrdenesCount(count || 0);

    const { data: riderProfile } = await supabase
      .from('fat_riders')
      .select('*')
      .limit(1)
      .single();

    if (riderProfile) {
      setUser(riderProfile);
      setPhone(riderProfile.phone || "");
      setWhatsapp(riderProfile.whatsapp || "");
      
      const { data: ordenActiva } = await supabase
        .from('fat_pedidos')
        .select('id')
        .eq('rider_id', riderProfile.id)
        .not('status', 'in', '("entregado","cancelado")') 
        .maybeSingle();

      if (ordenActiva) {
        setStatus("ocupado");
      } else {
        setStatus("desconectado");
      }
    }
    setLoading(false);
  }, [obtenerSaludo]);

  useEffect(() => {
    fetchClima();
    loadRiderData();
    const interval = setInterval(() => {
        fetchClima();
        setSaludo(obtenerSaludo());
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchClima, loadRiderData, obtenerSaludo]);

  const toggleStatus = () => {
    if (status === "ocupado") return;
    setStatus(status === "disponible" ? "desconectado" : "disponible");
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('fat_riders')
      .update({ phone, whatsapp })
      .eq('id', user.id);
    if (!error) alert("¡Perfil actualizado!");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-28 font-sans">
      <div className="w-full max-w-[400px] flex flex-col gap-5 mt-4">
        
        {/* Header Superior */}
        <header className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="text-left">
            <h1 className="text-lg font-black italic text-gray-900 uppercase leading-none tracking-tighter">MonchoXpress</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nandaime, NI</p>
          </div>
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg shadow-orange-100">
            🛵
          </div>
        </header>

        {view === "inicio" ? (
          <>
            {/* Card de Bienvenida con Saludo Dinámico */}
            <section className="bg-gray-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex justify-between items-center transition-all duration-700">
              <div className="relative z-10 text-left">
                <p className="text-orange-400 text-[9px] font-black uppercase tracking-[0.2em]">{saludo}</p>
                <h2 className="text-xl font-black uppercase italic leading-tight">
                  {user?.first_name ? `${user.first_name}` : 'RIDER'}
                </h2>
                <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-tighter italic opacity-80">
                   {status === "disponible" ? "Estás activo para recibir pedidos" : "Conéctate para trabajar"}
                </p>
              </div>
              <div className="relative z-10 text-right">
                <span className="text-2xl block">{clima.icono}</span>
                <p className="text-[10px] font-black tracking-tighter">{clima.temp}°C</p>
                <p className="text-[8px] font-bold uppercase opacity-60 max-w-[60px] leading-tight">{clima.desc}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
            </section>

            {/* SECCIÓN DE ESTADO (SWITCH) */}
            <div className={`p-4 rounded-[2rem] border flex items-center justify-between transition-all duration-300 ${
              status === "disponible" ? "bg-green-50 border-green-200" : 
              status === "ocupado" ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200 shadow-sm"
            }`}>
              <div className="flex flex-col ml-2 text-left">
                <p className="text-[9px] font-black uppercase text-gray-400 leading-none mb-1 tracking-widest">Estatus de conexión</p>
                <h3 className={`text-[13px] font-black uppercase italic ${
                  status === "disponible" ? "text-green-600" : 
                  status === "ocupado" ? "text-orange-600" : "text-gray-400"
                }`}>
                  {status === "disponible" ? "● Disponible" : 
                   status === "ocupado" ? "● Ocupado" : "○ Desconectado"}
                </h3>
              </div>
              
              <button 
                onClick={toggleStatus}
                disabled={status === "ocupado"}
                className={`w-14 h-8 rounded-full relative p-1 transition-colors duration-500 shadow-inner ${
                  status === "disponible" ? "bg-green-500" : 
                  status === "ocupado" ? "bg-orange-400 opacity-50" : "bg-gray-300"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-500 transform ${
                  (status === "disponible" || status === "ocupado") ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  if(status === "desconectado") return alert("Debes estar 'Disponible' para gestionar órdenes");
                  router.push('/rider/ordenes');
                }}
                className={`bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-left active:scale-95 transition-all ${status === 'desconectado' && 'opacity-60 grayscale-[0.5]'}`}
              >
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl mb-3">📦</div>
                <p className="text-xs font-black uppercase text-gray-800 italic">Órdenes</p>
                <p className="text-[9px] font-black uppercase text-orange-500">Libres: {ordenesCount}</p>
              </button>

              <button 
                onClick={() => setView("perfil")}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-left active:scale-95 transition-all"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl mb-3">👤</div>
                <p className="text-xs font-black uppercase text-gray-800 italic">Mi Perfil</p>
                <p className="text-[9px] font-black uppercase text-blue-500">Configurar</p>
              </button>
            </div>
          </>
        ) : (
          /* Vista Perfil */
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <button onClick={() => setView("inicio")} className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">← Regresar al panel</button>
              <div className="text-center pt-2">
                <h2 className="text-lg font-black italic uppercase text-gray-900 leading-tight">{user?.first_name} {user?.last_name}</h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {user?.cedula}</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="text-left">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2 italic">Teléfono Celular</label>
                  <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="bg-gray-50 border-none rounded-xl p-3 text-sm w-full font-bold text-gray-700 focus:ring-2 focus:ring-orange-200 transition-all" />
                </div>
                <div className="text-left">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2 italic">Número WhatsApp</label>
                  <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} className="bg-gray-50 border-none rounded-xl p-3 text-sm w-full font-bold text-gray-700 focus:ring-2 focus:ring-orange-200 transition-all" />
                </div>
                <button onClick={handleUpdate} className="w-full bg-orange-500 text-white font-black italic uppercase py-4 rounded-2xl shadow-lg shadow-orange-100 text-[10px] tracking-widest active:scale-95 transition-all mt-4">
                  Guardar Cambios
                </button>
              </div>
          </div>
        )}

        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className="w-full bg-white text-gray-300 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-gray-50 active:scale-95 transition-transform"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Navbar Inferior */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[360px] h-16 bg-gray-900 rounded-[2rem] shadow-2xl flex items-center justify-around px-2 border border-white/10">
        <button onClick={() => setView("inicio")} className={`flex flex-col items-center gap-1 transition-all ${view === "inicio" ? "text-orange-500 scale-110" : "text-gray-500"}`}>
          <span className="text-xl">🏠</span>
          <span className="text-[8px] font-black uppercase italic">Dashboard</span>
        </button>
        <button onClick={() => setView("perfil")} className={`flex flex-col items-center gap-1 transition-all ${view === "perfil" ? "text-orange-500 scale-110" : "text-gray-500"}`}>
          <span className="text-xl">👤</span>
          <span className="text-[8px] font-black uppercase italic">Mi Cuenta</span>
        </button>
      </nav>
    </main>
  );
}