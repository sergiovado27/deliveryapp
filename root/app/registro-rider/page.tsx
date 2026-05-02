"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RegistroRider() {
  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    cedula: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    direccion: "",
    telefono: "",
    whatsapp: "",
    nacionalidad: "Nicaragüense",
  });

  const [edad, setEdad] = useState<number | null>(null);
  const [mismoWhatsapp, setMismoWhatsapp] = useState(false);

  // Lógica para calcular la edad automáticamente
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setEdad(age);
    }
  }, [formData.fechaNacimiento]);

  // Lógica para sincronizar WhatsApp
  useEffect(() => {
    if (mismoWhatsapp) {
      setFormData((prev) => ({ ...prev, whatsapp: prev.telefono }));
    }
  }, [mismoWhatsapp, formData.telefono]);

  const handleCedula = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite números y solo una letra al final (Formato NI)
    const value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (value.length <= 14) {
      const numbers = value.replace(/[A-Z]/g, "");
      const letter = value.replace(/[0-9]/g, "").slice(0, 1);
      setFormData({ ...formData, cedula: numbers + letter });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-10">
      <div className="max-w-[450px] mx-auto space-y-6">
        
        <header className="flex items-center gap-4">
          <Link href="/" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Nuevo FatRider</h1>
        </header>

        <form className="space-y-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          
          {/* FOTO - Placeholder por ahora */}
          <div className="flex flex-col items-center py-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center p-2 cursor-pointer">
              Subir Foto Obligatoria
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Primer Nombre *</label>
              <input 
                required
                className="bg-gray-50 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-orange-500" 
                type="text" 
                onChange={(e) => setFormData({...formData, primerNombre: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Segundo Nombre</label>
              <input 
                className="bg-gray-50 border-none rounded-2xl p-3 text-sm" 
                type="text" 
                onChange={(e) => setFormData({...formData, segundoNombre: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Primer Apellido *</label>
              <input 
                required
                className="bg-gray-50 border-none rounded-2xl p-3 text-sm" 
                type="text" 
                onChange={(e) => setFormData({...formData, primerApellido: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Segundo Apellido</label>
              <input 
                className="bg-gray-50 border-none rounded-2xl p-3 text-sm" 
                type="text" 
                onChange={(e) => setFormData({...formData, segundoApellido: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Cédula * (Ej: 0011205900001A)</label>
            <input 
              required
              value={formData.cedula}
              onChange={handleCedula}
              placeholder="0000000000000A"
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm font-mono tracking-widest" 
              type="text" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Fecha Nac. *</label>
              <input 
                required
                className="bg-gray-50 border-none rounded-2xl p-3 text-sm" 
                type="date" 
                onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Edad Calculada</label>
              <div className="bg-orange-50 text-orange-600 font-bold rounded-2xl p-3 text-sm text-center">
                {edad !== null ? `${edad} años` : "--"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Lugar de Nacimiento *</label>
            <input 
              required
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm" 
              type="text" 
              onChange={(e) => setFormData({...formData, lugarNacimiento: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Dirección Domicilio *</label>
            <textarea 
              required
              className="bg-gray-50 border-none rounded-2xl p-3 text-sm h-20" 
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">Teléfono *</label>
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
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                checked={mismoWhatsapp}
                onChange={(e) => setMismoWhatsapp(e.target.checked)}
              />
              <span className="text-xs text-gray-500">Usar mismo número para WhatsApp</span>
            </label>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-2">WhatsApp</label>
              <input 
                disabled={mismoWhatsapp}
                value={formData.whatsapp}
                className={`bg-gray-50 border-none rounded-2xl p-3 text-sm ${mismoWhatsapp ? 'opacity-50' : ''}`} 
                type="tel" 
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl mt-4 shadow-lg shadow-orange-100 active:scale-95 transition-transform"
          >
            Guardar FatRider
          </button>

        </form>
      </div>
    </main>
  );
}