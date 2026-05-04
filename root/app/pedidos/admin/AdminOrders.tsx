"use client";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        businesses ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) console.error("Error:", error);
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(true);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => { fetchOrders(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) alert("Error al actualizar: " + error.message);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Finalized') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'In Transit') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    // Usamos la misma clase de tu página de crear pedido
    <main className="min-h-screen bg-gray-50 p-4 pb-32 text-gray-800 font-sans">
      <div className="max-w-[450px] mx-auto space-y-6">
        
        {/* HEADER IDÉNTICO */}
        <header className="flex items-center gap-4">
          <Link href="/" className="bg-white p-2 px-3 rounded-xl shadow-sm border border-gray-100 font-bold">
            ←
          </Link>
          <h1 className="text-xl font-bold italic uppercase tracking-tight text-gray-900">
            Mis Encargos
          </h1>
          <button 
            onClick={() => fetchOrders(true)}
            className="ml-auto bg-white p-2 rounded-xl shadow-sm border border-gray-100"
          >
            🔄
          </button>
        </header>

        {loading ? (
          <p className="text-center text-gray-400 py-10 font-bold uppercase text-[10px] tracking-widest">
            Sincronizando pedidos...
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="w-full bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 transition-all">
                
                {/* INFO DEL PEDIDO */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 leading-tight pt-1">
                      {order.businesses?.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                      Cliente: {order.customer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-orange-600">
                      C$ {order.total}
                    </p>
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">
                      ID: {order.id.slice(-5)}
                    </p>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN (ESTILO REALIZAR PEDIDO) */}
                <div className="pt-4 border-t border-gray-50 flex gap-2">
                  <button 
                    onClick={() => updateStatus(order.id, 'Created')}
                    className={`flex-1 py-3 rounded-2xl text-[9px] font-black transition-all ${order.status === 'Created' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}
                  >
                    NUEVO
                  </button>
                  <button 
                    onClick={() => updateStatus(order.id, 'In Transit')}
                    className={`flex-1 py-3 rounded-2xl text-[9px] font-black transition-all ${order.status === 'In Transit' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}
                  >
                    RIDER
                  </button>
                  <button 
                    onClick={() => updateStatus(order.id, 'Finalized')}
                    className={`flex-1 py-3 rounded-2xl text-[9px] font-black transition-all ${order.status === 'Finalized' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}
                  >
                    LISTO
                  </button>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic">No hay pedidos registrados</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}