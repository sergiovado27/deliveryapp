"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

export default function EditorNegocio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [showModalGuardar, setShowModalGuardar] = useState(false);
  const [showModalDescartar, setShowModalDescartar] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [estadoNegocio, setEstadoNegocio] = useState<string>("activo"); // Estado para el banner

  const [formData, setFormData] = useState({
    nombre: "",
    departamento: "",
    telefono: "",
    whatsapp: "",
    categoria: "",
    direccionExacta: "",
    google_maps_url: ""
  });

  // Cargar datos actuales del negocio
  useEffect(() => {
    const cargarNegocio = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setEstadoNegocio(data.status); // Guardamos el estado (activo/inactivo)
        setFormData({
          nombre: data.name,
          departamento: data.department,
          telefono: data.phone,
          whatsapp: data.whatsapp || "",
          categoria: data.category,
          direccionExacta: data.exact_address || "",
          google_maps_url: data.google_maps_url || ""
        });
      }
      setLoading(false);
    };
    cargarNegocio();
  }, [id]);

  const validarYConfirmar = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores = [];
    if (!formData.nombre) nuevosErrores.push("nombre");
    if (!formData.departamento) nuevosErrores.push("departamento");
    if (!formData.telefono) nuevosErrores.push("telefono");
    if (!formData.categoria) nuevosErrores.push("categoria");

    setErrores(nuevosErrores);

    if (nuevosErrores.length === 0) {
      setShowModalGuardar(true);
    } else {
      alert("Por favor rellena los campos obligatorios marcados en rojo.");
    }
  };

  const guardarCambios = async () => {
    const { error } = await supabase
      .from('businesses')
      .update({
        name: formData.nombre,
        department: formData.departamento,
        phone: formData.telefono,
        whatsapp: formData.whatsapp,
        category: formData.categoria,
        exact_address: formData.direccionExacta,
        google_maps_url: formData.google_maps_url
      })
      .eq('id', id);

    if (!error) {
      // Redirigir a la vista de inventario unificada
      window.location.href = "/registro-negocio/ver";
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando datos del negocio...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 🚩 BANNER DE ADVERTENCIA: Solo aparece si está inactivo */}
      {estadoNegocio === 'inactivo' && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 sticky top-0 z-40 animate-pulse">
          <div className="max-w-[450px] mx-auto flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-amber-800 font-bold text-[13px]">Negocio dado de Baja</p>
              <p className="text-amber-700 text-[10px] leading-tight">Este negocio está actualmente <b>INACTIVO</b>. Los cambios se guardarán pero no serán visible al público.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[450px] mx-auto p-4 space-y-6">
        
        <header className="flex items-center justify-between mt-2">
          <button onClick={() => setShowModalDescartar(true)} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Editar Negocio</h1>
          <div className="w-10"></div>
        </header>

        <form onSubmit={validarYConfirmar} className="space-y-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className={`text-[10px] font-bold uppercase ml-2 ${errores.includes('nombre') ? 'text-red-500' : 'text-gray-400'}`}>
              Nombre del Negocio * {errores.includes('nombre') && "(Obligatorio)"}
            </label>
            <input 
              className={`bg-gray-50 border-none rounded-2xl p-3 text-sm transition-all ${errores.includes('nombre') ? 'ring-2 ring-red-200' : ''}`}
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label className={`text-[10px] font-bold uppercase ml-2 ${errores.includes('telefono') ? 'text-red-500' : 'text-gray-400'}`}>
              Teléfono *
            </label>
            <input 
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm"
              type="tel" 
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            />
          </div>

          {/* Dirección Exacta */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 italic">Dirección Exacta</label>
            <textarea 
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm h-20 resize-none"
              value={formData.direccionExacta}
              onChange={(e) => setFormData({...formData, direccionExacta: e.target.value})}
            />
          </div>

          {/* Link de Google Maps */}
          <div className="flex flex-col gap-1 bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <label className="text-[10px] font-bold uppercase text-orange-600 ml-1">Enlace de Google Maps</label>
            <input 
              placeholder="Pegar URL de Google Maps..."
              className="bg-white border-none rounded-xl p-2 text-xs mt-1 shadow-sm"
              type="text" 
              value={formData.google_maps_url}
              onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button 
              type="button"
              onClick={() => setShowModalDescartar(true)}
              className="bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl active:scale-95 transition-all text-sm"
            >
              Descartar
            </button>
            <button 
              type="submit"
              className="bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>

      {/* MODAL GUARDAR */}
      {showModalGuardar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-[320px] text-center space-y-6 shadow-2xl">
            <p className="font-bold text-gray-800 text-lg">¿Estás seguro de guardar los cambios?</p>
            <div className="flex flex-col gap-3">
              <button onClick={guardarCambios} className="bg-orange-600 text-white py-3 rounded-xl font-bold active:scale-95 transition-all">Sí, guardar</button>
              <button onClick={() => setShowModalGuardar(false)} className="text-gray-400 text-sm font-medium">No, continuar editando</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DESCARTAR */}
      {showModalDescartar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-[320px] text-center space-y-6 shadow-2xl">
            <p className="font-bold text-gray-800 text-lg">¿Estás seguro de descartar los cambios?</p>
            <p className="text-xs text-gray-400">Se perderá toda la información editada.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.href = "/registro-negocio/ver"} 
                className="bg-red-500 text-white py-3 rounded-xl font-bold active:scale-95 transition-all"
              >
                Sí, descartar
              </button>
              <button onClick={() => setShowModalDescartar(false)} className="text-gray-800 text-sm font-medium">No, continuar editando</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}