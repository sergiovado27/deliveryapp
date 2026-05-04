"use client";
import { useState } from 'react';
import { supabase } from "@/lib/supabase";

interface Props {
  negocio: any;
  productos: any[];
  carritoInicial: { [key: string]: number };
  onBack: () => void; // Para regresar a editar
}

export default function ConfirmarPedido({ negocio, productos, carritoInicial, onBack }: Props) {
  const [carrito, setCarrito] = useState(carritoInicial);
  const [cliente, setCliente] = useState({ nombre: '', whatsapp: '', direccion: '' });
  const [enviando, setEnviando] = useState(false);

  const DELIVERY_FEE = 50;

  // Filtrar solo los productos seleccionados para la lista de edición rápida
  const itemsSeleccionados = productos.filter(p => carrito[p.id] > 0);

  const subtotal = itemsSeleccionados.reduce((acc, p) => acc + (p.price * carrito[p.id]), 0);
  const total = subtotal + DELIVERY_FEE;

  const ajustarEnRevision = (id: string, cambio: number, stock: number) => {
    const nuevaCant = (carrito[id] || 0) + cambio;
    if (nuevaCant < 0) return;
    if (nuevaCant > stock) return alert("No hay más stock disponible");
    setCarrito({ ...carrito, [id]: nuevaCant });
  };

  const guardarPedido = async () => {
    if (!cliente.nombre || !cliente.whatsapp || !cliente.direccion) {
      return alert("Por favor completa todos los datos de envío");
    }

    setEnviando(true);
    
    try {
      // 1. Insertar la Orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          business_id: negocio.id,
          customer_name: cliente.nombre,
          whatsapp: cliente.whatsapp,
          address: cliente.direccion,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insertar los items y actualizar stock
      for (const item of itemsSeleccionados) {
        // Guardar detalle
        await supabase.from('order_items').insert({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: carrito[item.id],
          price_at_time: item.price
        });

        // Restar del stock real (Lógica de inventario)
        await supabase
          .from('menu_items')
          .update({ stock: item.stock - carrito[item.id] })
          .eq('id', item.id);
      }

      alert("¡Pedido guardado con éxito!");
      window.location.href = "/"; // O a una pantalla de éxito

    } catch (error: any) {
      alert("Error al procesar: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 animate-in fade-in">
      <div className="max-w-[450px] mx-auto space-y-6">
        
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">←</button>
          <h1 className="text-xl font-bold">Detalles de Entrega</h1>
        </header>

        {/* Formulario de Cliente */}
        <section className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4">
           <input 
              placeholder="Nombre de quién recibe *" 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setCliente({...cliente, nombre: e.target.value})}
           />
           <input 
              placeholder="WhatsApp *" 
              type="tel"
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setCliente({...cliente, whatsapp: e.target.value})}
           />
           <textarea 
              placeholder="Dirección exacta de entrega *" 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 h-24"
              onChange={(e) => setCliente({...cliente, direccion: e.target.value})}
           />
        </section>

        {/* Resumen de Artículos (Edición Rápida) */}
        <section className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase ml-2">Revisar Pedido</p>
          {itemsSeleccionados.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
              <div className="flex-1">
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-orange-600 font-bold text-xs">C$ {p.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => ajustarEnRevision(p.id, -1, p.stock)} className="text-gray-300 font-bold px-2">−</button>
                <span className="font-black text-sm">{carrito[p.id]}</span>
                <button onClick={() => ajustarEnRevision(p.id, 1, p.stock)} className="text-orange-500 font-bold px-2">+</button>
              </div>
            </div>
          ))}
        </section>

        {/* Desglose de Costos */}
        <section className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-3">
           <div className="flex justify-between opacity-70 text-sm font-bold">
              <span>Subtotal</span>
              <span>C$ {subtotal.toFixed(2)}</span>
           </div>
           <div className="flex justify-between opacity-70 text-sm font-bold">
              <span>Costo Delivery</span>
              <span>C$ {DELIVERY_FEE.toFixed(2)}</span>
           </div>
           <div className="border-t border-white/10 pt-3 flex justify-between items-end">
              <span className="font-bold text-orange-400">TOTAL A PAGAR</span>
              <span className="text-3xl font-black italic">C$ {total.toFixed(2)}</span>
           </div>

           <button 
              disabled={enviando || itemsSeleccionados.length === 0}
              onClick={guardarPedido}
              className="w-full bg-orange-500 text-white p-5 rounded-2xl font-black mt-4 active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
           >
              {enviando ? "Procesando..." : "Finalizar Pedido"}
           </button>
        </section>
      </div>
    </div>
  );
}