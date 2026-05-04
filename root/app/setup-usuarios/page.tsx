"use client";
import { supabase } from "@/lib/supabase";

export default function SetupPage() {
  const crear = async (id: string, rol: string, nombre: string) => {
    const email = `${id.replace(/\s+/g, '').toLowerCase()}@fatrider.app`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: "admin",
      options: { data: { full_name: nombre, role: rol } }
    });
    if (error) alert("Error: " + error.message);
    else alert("Usuario " + rol + " creado!");
  };

  return (
    <div className="p-10 space-y-4">
      <button onClick={() => crear('admin', 'superadmin', 'Sergio Admin')} className="p-4 bg-red-500 text-white rounded">Crear Superadmin</button>
      <button onClick={() => crear('441-120590-0001X', 'rider', 'Juan Rider')} className="p-4 bg-blue-500 text-white rounded">Crear Rider (Cédula)</button>
      <button onClick={() => crear('Bodega El Romeo', 'vendor', 'Bodega Romeo')} className="p-4 bg-orange-500 text-white rounded">Crear Vendor (Negocio)</button>
    </div>
  );
}