"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function GestionBajas() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  useEffect(() => {
    fetchNegocios();
  }, []);

  const fetchNegocios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error al cargar negocios:", error);
    } else if (data) {
      setNegocios(data);
    }
    setLoading(false);
  };

  const verDetalle = async (negocio: any) => {
    setSeleccionado(negocio);
    const { data, error } = await supabase
      .from('business_logs')
      .select('*')
      .eq('business_id', negocio.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error al cargar logs:", error);
      setLogs([]);
    } else if (data) {
      setLogs(data);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    const action = nuevoEstado === 'activo' ? 'alta' : 'baja';
    
    // 1. Actualizar negocio con captura de errores
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ 
        status: nuevoEstado, 
        status_updated_at: new Date().toISOString(),
        last_edited_by: 'SuperAdmin' 
      })
      .eq('id', seleccionado.id);

    if (updateError) {
      console.error("Error de Update:", updateError);
      alert(`Error al actualizar: ${updateError.message}`);
      return;
    }

    // 2. Crear Log
    const { error: logError } = await supabase
      .from('business_logs')
      .insert([
        { 
          business_id: seleccionado.id, 
          action: action, 
          performed_by: 'SuperAdmin' 
        }
      ]);

    if (logError) {
      console.error("Error de Log:", logError);
      // No bloqueamos el flujo, pero lo registramos en consola
    }

    alert(`Negocio dado de ${action === 'alta' ? 'alta' : 'baja'} con éxito`);
    setSeleccionado(null);
    fetchNegocios();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-[450px] mx-auto space-y-4">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/registro-negocio" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Estado de Negocios</h1>
        </header>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando lista...</div>
        ) : (
          <div className="grid gap-3">
            {negocios.map((n) => (
              <button 
                key={n.id} 
                onClick={() => verDetalle(n)}
                className={`w-full p-4 rounded-[2rem] flex items-center justify-between border transition-all ${
                  n.status === 'inactivo' 
                  ? 'bg-gray-100 border-gray-200 grayscale opacity-70' 
                  : 'bg-white border-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="text-2xl">{n.status === 'activo' ? '🏪' : '🌑'}</span>
                  <div>
                    <p className={`font-bold ${n.status === 'inactivo' ? 'text-gray-500' : 'text-gray-800'}`}>{n.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{n.status}</p>
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
          <div className="bg-white w-full max-w-[500px] mx-auto rounded-t-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto cursor-pointer" onClick={() => setSeleccionado(null)} />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{seleccionado.name}</h2>
              <p className="text-sm text-gray-400">Estado: <span className={`font-bold uppercase ${seleccionado.status === 'activo' ? 'text-green-500' : 'text-red-500'}`}>{seleccionado.status}</span></p>
            </div>

            {/* Panel de Historial */}
            <div className="bg-gray-50 rounded-3xl p-5 space-y-3 max-h-40 overflow-y-auto border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Historial de cambios</p>
              {logs.length === 0 ? (
                <p className="text-xs text-gray-300 italic text-center">Sin movimientos registrados.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex justify-between items-center text-[11px] border-b border-gray-200 pb-2">
                    <span className={`font-bold px-2 py-0.5 rounded-md ${log.action === 'alta' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {log.action.toUpperCase()}
                    </span>
                    <span className="text-gray-500">{new Date(log.created_at).toLocaleString('es-NI')}</span>
                    <span className="text-gray-400 italic">por {log.performed_by}</span>
                  </div>
                ))
              )}
            </div>

            {/* Acciones Directas */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <Link 
                href={`/registro-negocio/editar/${seleccionado.id}`} 
                className="w-full bg-gray-800 text-white text-center py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
              >
                ✏️ Editar Información
              </Link>
              
              {seleccionado.status === 'activo' ? (
                <button 
                  onClick={() => cambiarEstado('inactivo')} 
                  className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold border border-red-100 active:scale-95 transition-all"
                >
                  🚫 Dar de Baja
                </button>
              ) : (
                <button 
                  onClick={() => cambiarEstado('activo')} 
                  className="w-full bg-green-50 text-green-600 py-4 rounded-2xl font-bold border border-green-100 active:scale-95 transition-all"
                >
                  ✅ Dar de Alta (Activar)
                </button>
              )}
              
              <button 
                onClick={() => setSeleccionado(null)} 
                className="w-full py-2 text-gray-400 text-sm font-medium"
              >
                Cancelar y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}