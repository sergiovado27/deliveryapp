"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function SeleccionarEdicion() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNegocios = async () => {
      const { data } = await supabase.from('businesses').select('*').order('name');
      if (data) setNegocios(data);
      setLoading(false);
    };
    fetchNegocios();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[400px] mx-auto space-y-6">
        <header className="flex items-center gap-4">
          <Link href="/registro-negocio" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Seleccionar Negocio</h1>
        </header>

        {loading ? <p className="text-center text-gray-400">Cargando negocios...</p> : (
          <div className="grid gap-3">
            {negocios.map((negocio) => (
              <Link key={negocio.id} href={`/registro-negocio/editar/${negocio.id}`}>
                <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 active:scale-95 transition-all">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                    🏪
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{negocio.name}</p>
                    <p className="text-xs text-gray-400">{negocio.category} • {negocio.department}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}