"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ListaRiders() {
  const [riders, setRiders] = useState<any[]>([]);
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

  const cambiarEstado = async (nuevoEstado: string) => {
    const { error } = await supabase
      .from('fat_riders')
      .update({ 
        status: nuevoEstado,
        // Aquí podrías usar 'SuperAdmin' como hicimos ayer
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
        <header className="flex items-center gap-4 mb-6">
          <Link href="/registro-rider" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Estado de Riders</h1>
        </header>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando lista...</div>
        ) : (
          <div className="grid gap-3">
            {riders.map((r) => (
              <button 
                key={r.id} 
                onClick={() => setSeleccionado(r)}
                className={`w-full p-4 rounded-[2rem] flex items-center justify-between border transition-all ${
                  r.status === 'inactivo' ? 'bg-gray-100 grayscale opacity-70' : 'bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="text-2xl">{r.status === 'activo' ? '🛵' : '🌑'}</span>
                  <div>
                    <p className="font-bold text-gray-800">{r.first_name} {r.last_name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{r.status || 'SIN ESTADO'}</p>
                  </div>
                </div>
                <span className="text-gray-300 font-bold">⋮</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DE GESTIÓN (MODAL) */}
      {seleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end">
          <div className="bg-white w-full max-w-[500px] mx-auto rounded-t-[3rem] p-8 space-y-6 shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" onClick={() => setSeleccionado(null)} />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{seleccionado.first_name} {seleccionado.last_name}</h2>
              <p className="text-sm text-gray-400">Cédula: {seleccionado.cedula}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link 
                href={`/registro-rider/editar/${seleccionado.id}`} 
                className="w-full bg-gray-800 text-white text-center py-4 rounded-2xl font-bold shadow-lg"
              >
                ✏️ Editar Información
              </Link>
              
              <button 
                onClick={() => cambiarEstado(seleccionado.status === 'activo' ? 'inactivo' : 'activo')} 
                className={`w-full py-4 rounded-2xl font-bold border ${
                  seleccionado.status === 'activo' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                }`}
              >
                {seleccionado.status === 'activo' ? '🚫 Dar de Baja' : '✅ Dar de Alta'}
              </button>
              
              <button onClick={() => setSeleccionado(null)} className="w-full py-2 text-gray-400 text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}