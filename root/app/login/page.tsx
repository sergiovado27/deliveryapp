"use client";
import { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convertimos el identificador (Cédula o Negocio) en el formato de email que acordamos
    const email = `${identificador.replace(/\s+/g, '').toLowerCase()}@fatrider.app`;
    const password = "admin";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
      return;
    }

    // Consultamos el perfil para saber a dónde mandarlo
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'superadmin') router.push('/admin');
    else if (profile?.role === 'rider') router.push('/rider');
    else if (profile?.role === 'vendor') router.push('/vendor/dashboard');
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <h1 className="text-3xl font-black italic text-center mb-2 text-gray-900">MonchoXpress</h1>
        <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Acceso de Personal</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Identificador (Cédula o Negocio)</label>
            <input 
              type="text"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-orange-500 outline-none transition-all"
              placeholder="Ej: 001-000000-0000X"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}