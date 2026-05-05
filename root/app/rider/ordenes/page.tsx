"use client";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function OrdenesLibres() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrdenes = async () => {
      setLoading(true);
      
      // 1. Obtener el rider actual (ajusta según tu auth)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: rider } = await supabase
        .from('fat_riders')
        .select('*')
        .eq('email', authUser.email)
        .single();
      
      setUser(rider);

      // 2. Traer órdenes que no tienen repartidor asignado
      const { data, error } = await supabase
        .from('fat_pedidos')
        .select('*')
        .is('rider_id', null)
        .order('created_at', { ascending: false });

      if (!error) setOrdenes(data || []);
      setLoading(false);
    };

    fetchOrdenes();
  }, [router]);

  const tomarOrden = async (pedidoId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('fat_pedidos')
      .update({ 
        rider_id: user.id,
        status: 'en_camino' // Cambiamos el estado automáticamente
      })
      .eq('id', pedidoId);

    if (error) {
      alert("Alguien más tomó esta orden primero o hubo un error.");
    } else {
      alert("¡Orden asignada! Ve por ella.");
      router.push('/rider/dashboard'); // O a una vista de "Mi orden actual"
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24 font-sans">
      <div className="w-full max-w-[400px] mx-auto mt-4">
        
        <header className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400">←</button>
          <div>
            <h1 className="text-xl font-black italic uppercase text-gray-900 leading-none">Órdenes Libres</h1>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Disponibles ahora</p>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Buscando pedidos...</div>
        ) : ordenes.length === 0 ? (
          <div className="bg-white p-10 rounded-[2.5rem] text-center border border-gray-100 shadow-sm">
            <span className="text-4xl block mb-4">😴</span>
            <p className="text-xs font-black uppercase text-gray-400">No hay órdenes por ahora</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ordenes.map((orden) => (
              <div key={orden.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Pedido #{orden.id.slice(0, 5)}</p>
                    <h3 className="text-sm font-black uppercase italic text-gray-900">{orden.cliente_nombre || 'Cliente'}</h3>
                  </div>
                  <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-3 py-1 rounded-full uppercase italic">
                    C$ {orden.total}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-lg">📍</span>
                  <p className="text-[11px] font-bold leading-tight">{orden.direccion_entrega}</p>
                </div>

                <button 
                  onClick={() => tomarOrden(orden.id)}
                  className="w-full bg-gray-900 text-white font-black italic uppercase py-4 rounded-2xl text-[10px] tracking-widest active:scale-95 transition-all mt-2"
                >
                  Aceptar Pedido →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}