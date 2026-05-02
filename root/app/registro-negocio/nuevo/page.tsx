"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Asegúrate de tener este archivo creado
import Link from "next/link";

const DEPARTAMENTOS_NI = [
  "Boaco", "Carazo", "Chinandega", "Chontales", "Estelí", "Granada", 
  "Jinotega", "León", "Madriz", "Managua", "Masaya", "Matagalpa", 
  "Nueva Segovia", "Río San Juan", "Rivas", "RACCN", "RACCS"
];

const CATEGORIAS = ["Licorería", "Restaurante", "Farmacia", "Ferretería", "Tienda de Ropa", "Otro"];

export default function RegistroNegocio() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    departamento: "",
    telefono: "",
    whatsapp: "",
    categoria: "",
    direccionExacta: "",
  });

  const [mismoWhatsapp, setMismoWhatsapp] = useState(false);

  // Sincronización de WhatsApp
  useEffect(() => {
    if (mismoWhatsapp) {
      setFormData((prev) => ({ ...prev, whatsapp: prev.telefono }));
    }
  }, [mismoWhatsapp, formData.telefono]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('businesses')
      .insert([
        { 
          name: formData.nombre,
          department: formData.departamento,
          phone: formData.telefono,
          whatsapp: formData.whatsapp,
          category: formData.categoria,
          exact_address: formData.direccionExacta
        }
      ]);

    if (error) {
      console.error("Error de Supabase:", error);
      alert(`Error al guardar: ${error.message}`);
    } else {
      alert("¡Negocio registrado con éxito!");
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-10">
      <div className="max-w-[450px] mx-auto space-y-6">
        
        <header className="flex items-center gap-4">
          <Link href="/" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Nuevo Negocio</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Nombre del Negocio *</label>
            <input 
              required
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-500" 
              type="text" 
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Departamento *</label>
            <select 
              required
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm appearance-none"
              onChange={(e) => setFormData({...formData, departamento: e.target.value})}
            >
              <option value="">Seleccionar...</option>
              {DEPARTAMENTOS_NI.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Categoría *</label>
            <select 
              required
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm appearance-none"
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            >
              <option value="">Seleccionar...</option>
              {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Teléfono de Negocio *</label>
              <input 
                required
                className="bg-gray-50 border-none rounded-2xl p-3 text-sm" 
                type="tel" 
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              />
            </div>

            <label className="flex items-center gap-2 ml-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-orange-500"
                checked={mismoWhatsapp}
                onChange={(e) => setMismoWhatsapp(e.target.checked)}
              />
              <span className="text-xs text-gray-500">Mismo número para pedidos WhatsApp</span>
            </label>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">WhatsApp de Pedidos</label>
              <input 
                disabled={mismoWhatsapp}
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className={`bg-gray-50 border-none rounded-2xl p-3 text-sm ${mismoWhatsapp ? 'opacity-50' : ''}`} 
                type="tel" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-gray-50 pt-4">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2 italic">Ubicación / Dirección Exacta</label>
            <textarea 
              placeholder="Escribe la dirección o pega un link de Google Maps..."
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm h-24" 
              onChange={(e) => setFormData({...formData, direccionExacta: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-orange-600'} text-white font-bold py-4 rounded-2xl mt-4 shadow-lg active:scale-95 transition-all`}
          >
            {loading ? "Guardando..." : "Registrar Negocio"}
          </button>

        </form>
      </div>
    </main>
  );
}