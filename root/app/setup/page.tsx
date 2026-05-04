"use client";
import { supabase } from "@/lib/supabase";

export default function Setup() {
  const crearUsuario = async (identificador: string, rol: 'superadmin' | 'rider' | 'vendor', nombre: string) => {
    const email = `${identificador.replace(/\s+/g, '').toLowerCase()}@fatrider.app`;
    
    // 1. Registro en Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password: "admin", // La contraseña que acordamos
    });

    if (authError) return alert("Error en Auth: " + authError.message);

    // 2. Registro en tabla Profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user?.id,
      role: rol,
      full_name: nombre,
      business_name: rol === 'vendor' ? identificador : null,
      cedula: rol === 'rider' ? identificador : null
    });

    if (profileError) alert("Error en Perfil: " + profileError.message);
    else alert(`Usuario ${rol} creado con éxito. Login: ${identificador}`);
  };

  return (
    <div className="p-10 flex flex-col gap-4 items-center bg-white min-h-screen text-black">
      <h1 className="text-xl font-bold">Configuración Inicial FatRider</h1>
      <button onClick={() => crearUsuario('admin', 'superadmin', 'Sergio Admin')} className="p-4 bg-black text-white rounded-xl w-64">Crear SuperAdmin</button>
      <button onClick={() => crearUsuario('441-120590-0001X', 'rider', 'Juan Rider')} className="p-4 bg-orange-500 text-white rounded-xl w-64">Crear Rider (Cédula)</button>
      <button onClick={() => crearUsuario('Bodega Romeo', 'vendor', 'Romeo Santos')} className="p-4 bg-blue-500 text-white rounded-xl w-64">Crear Vendor (Negocio)</button>
    </div>
  );
}