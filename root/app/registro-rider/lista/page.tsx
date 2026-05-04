"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ListaRiders() {
  const [riders, setRiders] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fat_riders')
      .select('*')
      .order('first_name');
    
    if (error) console.error("Error:", error);
    else setRiders(data || []);
    setLoading(false);
  };

  // LÓGICA DE FILTRADO (Busca en nombre completo y cédula)
  const ridersFiltrados = riders.filter((r) => {
    const nombreCompleto = `${r.first_name} ${r.second_name || ''} ${r.last_name} ${r.second_last_name || ''}`.toLowerCase();
    const coincideBusqueda = 
      nombreCompleto.includes(busqueda.toLowerCase()) || 
      r.cedula.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = 
      filtroEstado === "todos" || 
      r.status === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const cambiarEstado = async (nuevoEstado: string) => {
    const { error } = await supabase
      .from('fat_riders')
      .update({ 
        status: nuevoEstado,
        last_edited_by: 'SuperAdmin' 
      })
      .eq('id', seleccionado.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(`Rider actualizado a ${nuevoEstado}`);
      setSeleccionado(null);
      fetchRiders();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-[450px] mx-auto space-y-4">
        <header className="flex items-center gap-4 mb-2">
          <Link href="/registro-rider" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Estado de Riders</h1>
        </header>

        {/* BUSCADOR Y FILTROS */}
        <div className="space-y-2">
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="w-full p-4 rounded-2xl border-none shadow-sm text-sm pl-12"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <span className="absolute left-4 top-4 grayscale opacity-50">🔍</span>
          </div>
          
          <div className="flex gap-2">
            {["todos", "activo", "inactivo"].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  filtroEstado === estado 
                    ? "bg-orange-500 text-white border-orange-500 shadow-md" 
                    : "bg-white text-gray-400 border-transparent"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 font-medium">Buscando riders...</div>
        ) : (
          <div className="grid gap-3">
            {ridersFiltrados.length > 0 ? (
              ridersFiltrados.map((r) => (
                <button 
                  key={r.id} 
                  onClick={() => setSeleccionado(r)}
                  className={`w-full p-4 rounded-[2rem] flex items-center justify-between border transition-all ${
                    r.status === 'inactivo' ? 'bg-gray-100 opacity-60' : 'bg-white shadow-sm border-white'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-2xl">{r.status === 'activo' ? '🛵' : '🌑'}</span>
                    <div>
                      <p className="font-bold text-gray-800 leading-tight">
                        {r.first_name} {r.last_name}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                        {r.cedula} • {r.status || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-300 font-bold text-xl">⋮</span>
                </button>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No se encontraron resultados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PANEL DE GESTIÓN (MODAL) */}
      {seleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end">
          <div className="bg-white w-full max-w-[500px] mx-auto rounded-t-[3rem] p-8 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" onClick={() => setSeleccionado(null)} />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{seleccionado.first_name} {seleccionado.last_name}</h2>
              <div className="flex justify-center gap-2 mt-1">
                 <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-500 uppercase">{seleccionado.cedula}</span>
                 <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${seleccionado.status === 'activo' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {seleccionado.status}
                 </span>
              </div>
            </div>

            {/* TARJETA DE WHATSAPP DIRECTO */}
            <div className="bg-gray-50 rounded-3xl p-4 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">
                  💬
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</p>
                  <p className="font-bold text-gray-700">{seleccionado.whatsapp}</p>
                </div>
              </div>
              
              <a 
                href={`https://wa.me/${seleccionado.whatsapp.replace(/\D/g, '')}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform"
              >
                CHATEAR
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link 
                href={`/registro-rider/editar/${seleccionado.id}`} 
                className="w-full bg-gray-800 text-white text-center py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
              >
                ✏️ Editar Información
              </Link>
              
              <button 
                onClick={() => cambiarEstado(seleccionado.status === 'activo' ? 'inactivo' : 'activo')} 
                className={`w-full py-4 rounded-2xl font-bold border active:scale-95 transition-transform ${
                  seleccionado.status === 'activo' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                }`}
              >
                {seleccionado.status === 'activo' ? '🚫 Dar de Baja' : '✅ Dar de Alta'}
              </button>
              
              <button onClick={() => setSeleccionado(null)} className="w-full py-2 text-gray-400 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}