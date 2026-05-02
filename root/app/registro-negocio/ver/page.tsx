"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function VerNegocios() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  useEffect(() => { fetchNegocios(); }, []);

  const fetchNegocios = async () => {
    setLoading(true);
    const { data } = await supabase.from('businesses').select('*').order('name');
    if (data) setNegocios(data);
    setLoading(false);
  };

  const abrirGestion = async (negocio: any) => {
    setSeleccionado(negocio);
    const { data } = await supabase
      .from('business_logs')
      .select('*')
      .eq('business_id', negocio.id)
      .order('created_at', { ascending: false });
    if (data) setLogs(data);
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    const action = nuevoEstado === 'activo' ? 'alta' : 'baja';
    
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ 
        status: nuevoEstado, 
        status_updated_at: new Date().toISOString(),
        last_edited_by: 'SuperAdmin' 
      })
      .eq('id', seleccionado.id);

    if (updateError) return alert("Error: " + updateError.message);

    await supabase.from('business_logs').insert([
      { business_id: seleccionado.id, action, performed_by: 'SuperAdmin' }
    ]);

    alert(`Negocio puesto en ${nuevoEstado.toUpperCase()}`);
    setSeleccionado(null);
    fetchNegocios();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-[450px] mx-auto space-y-4">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/registro-negocio" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">←</Link>
          <h1 className="text-xl font-bold text-gray-800">Inventario de Negocios</h1>
        </header>

        <div className="grid gap-3">
          {negocios.map((n) => (
            <button 
              key={n.id} 
              onClick={() => abrirGestion(n)}
              className={`w-full p-4 rounded-[2rem] flex items-center justify-between border transition-all ${
                n.status === 'inactivo' 
                ? 'bg-gray-100 border-gray-200 grayscale opacity-60' 
                : 'bg-white border-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4 text-left">
                <span className="text-2xl">{n.status === 'activo' ? '🏪' : '🌑'}</span>
                <div>
                  <p className={`font-bold ${n.status === 'inactivo' ? 'text-gray-400' : 'text-gray-800'}`}>{n.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{n.status}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className="text-gray-300">⋮</span>
                 {n.status === 'inactivo' && <span className="text-[9px] bg-gray-200 px-2 py-0.5 rounded text-gray-500 font-bold">BAJA</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL DE GESTIÓN TOTAL */}
      {seleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end">
          <div className="bg-white w-full max-w-[500px] mx-auto rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" onClick={() => setSeleccionado(null)} />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{seleccionado.name}</h2>
              <p className="text-xs text-gray-400">Última modificación por <span className="font-bold text-gray-600">{seleccionado.last_edited_by || 'Sistema'}</span></p>
            </div>

            {/* Panel de Historial para SuperAdmin */}
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Logs de actividad</p>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {logs.length === 0 ? <p className="text-[11px] text-gray-300 text-center">Sin historial previo.</p> : logs.map(log => (
                  <div key={log.id} className="flex justify-between text-[10px] border-b border-gray-100 pb-1">
                    <span className={`font-bold ${log.action === 'alta' ? 'text-green-500' : 'text-red-500'}`}>{log.action.toUpperCase()}</span>
                    <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                    <span className="text-gray-400">por {log.performed_by}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link href={`/registro-negocio/editar/${seleccionado.id}`} className="w-full bg-gray-800 text-white text-center py-4 rounded-2xl font-bold shadow-lg">
                ✏️ Editar Datos
              </Link>
              
              {seleccionado.status === 'activo' ? (
                <button onClick={() => cambiarEstado('inactivo')} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold border border-red-100">
                  🚫 Dar de Baja
                </button>
              ) : (
                <button onClick={() => cambiarEstado('activo')} className="w-full bg-green-50 text-green-600 py-4 rounded-2xl font-bold border border-green-100">
                  ✅ Dar de Alta
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}