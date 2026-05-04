"use client";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";

export default function SeguimientoPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    // Traemos los pedidos ordenados por los más recientes
    const fetchPedidos = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          businesses (name)
        `)
        .order('created_at', { ascending: false });
      if (data) setPedidos(data);
    };
    fetchPedidos();
  }, []);

  // Función para definir el color del badge según el estado
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Created': return 'bg-blue-100 text-blue-600';
      case 'In Transit': return 'bg-orange-100 text-orange-600';
      case 'Finalized': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-6">Mis Encargos</h1>
      
      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">Pedido #{pedido.id.slice(0,5)}</p>
                <h3 className="font-bold text-lg">{pedido.businesses?.name}</h3>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${getStatusStyle(pedido.status)}`}>
                {pedido.status}
              </span>
            </div>

            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-xs text-gray-500">{pedido.customer_name}</p>
                <p className="font-black text-orange-500">C$ {pedido.total}</p>
              </div>
              
              {/* Solo permitimos ver detalles si no está Finalizado */}
              <button className="bg-gray-900 text-white text-xs px-4 py-2 rounded-xl font-bold">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}