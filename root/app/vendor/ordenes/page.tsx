"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function VendorOrders() {
  const [user, setUser] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [carrito, setCarrito] = useState<{ [key: string]: number }>({});
  const [form, setForm] = useState({ cliente: '', direccion: '', whatsapp: '' });
  // Cambiamos el paso inicial a 'gestion'
  const [paso, setPaso] = useState<'gestion' | 'seleccion' | 'confirmacion'>('gestion');
  const [enviando, setEnviando] = useState(false);

  const router = useRouter();
  const DELIVERY_FEE = 0; 

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      setUser(profile);

      if (profile?.business_id) {
        const { data: inv } = await supabase
          .from('menu_items')
          .select('*')
          .eq('business_id', profile.business_id)
          .eq('status', 'activo')
          .gt('stock', 0);
        setProductos(inv || []);

        const { data: peds } = await supabase
          .from('fat_pedidos')
          .select('*')
          .eq('business_id', profile.business_id)
          .order('created_at', { ascending: false });
        setPedidos(peds || []);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Nueva función para actualizar status desde la lista
  const actualizarStatus = async (pedidoId: string, nuevoStatus: string) => {
    const { error } = await supabase
      .from('fat_pedidos')
      .update({ status: nuevoStatus })
      .eq('id', pedidoId);
    
    if (!error) loadInitialData();
  };

  const ajustarCantidad = (id: string, cambio: number, stock: number) => {
    const actual = carrito[id] || 0;
    const nueva = actual + cambio;
    if (nueva < 0) return;
    if (nueva > stock) return alert(`Solo hay ${stock} en stock`);
    setCarrito({ ...carrito, [id]: nueva });
  };

  const itemsSeleccionados = productos.filter(p => carrito[p.id] > 0);
  const subtotal = itemsSeleccionados.reduce((acc, p) => acc + (p.price * carrito[p.id]), 0);
  const total = subtotal + DELIVERY_FEE;

  const handleFinalizarPedido = async () => {
    if (!form.cliente || !form.direccion || !form.whatsapp) {
      return alert("Todos los campos del cliente son obligatorios");
    }
    
    setEnviando(true);
    try {
      const { error: pedError } = await supabase
        .from('fat_pedidos')
        .insert([{
          business_id: user.business_id, 
          cliente_nombre: form.cliente,
          direccion_entrega: form.direccion,
          whatsapp: form.whatsapp, 
          total: total,
          status: 'pendiente'
        }]);

      if (pedError) throw pedError;

      for (const item of itemsSeleccionados) {
        await supabase
          .from('menu_items')
          .update({ stock: item.stock - carrito[item.id] })
          .eq('id', item.id);
      }

      alert("🚀 ¡Orden creada!");
      setCarrito({});
      setForm({ cliente: '', direccion: '', whatsapp: '' });
      setPaso('gestion'); // Regresamos a la lista
      loadInitialData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse uppercase text-gray-400">Preparando Panel...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-[450px] mx-auto space-y-6">
        
        <header className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
          <button 
            onClick={() => paso === 'gestion' ? router.back() : setPaso('gestion')} 
            className="bg-gray-50 w-10 h-10 rounded-xl shadow-inner italic font-black text-gray-400"
          >
            {paso === 'gestion' ? '←' : '✕'}
          </button>
          <div className="text-right">
            <h1 className="text-lg font-black italic text-gray-900 uppercase tracking-tighter leading-none">
              {user?.business_name || 'Mi Negocio'}
            </h1>
            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-1">
              {paso === 'gestion' ? 'Panel de Control' : 'Nuevo Despacho'}
            </p>
          </div>
        </header>

        {/* VISTA 1: GESTIÓN DE ÓRDENES (TU DISEÑO DE "ÚLTIMOS MOVIMIENTOS" PERO AMPLIADO) */}
        {paso === 'gestion' && (
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest text-left">Órdenes de hoy</h2>
            <div className="grid gap-3">
              {pedidos.length === 0 && <p className="p-10 text-center text-[10px] font-bold text-gray-300 uppercase">Sin órdenes activas</p>}
              {pedidos.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-left relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase ${p.status === 'pendiente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {p.status}
                  </div>
                  <p className="text-[9px] font-black text-blue-500 uppercase leading-none mb-1">Cliente</p>
                  <h3 className="font-black text-gray-800 text-xs uppercase">{p.cliente_nombre}</h3>
                  <p className="text-[10px] font-bold text-gray-400 truncate mb-3">{p.direccion_entrega}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className="font-black italic text-sm">C$ {p.total}</span>
                    <button 
                      onClick={() => actualizarStatus(p.id, p.status === 'pendiente' ? 'entregado' : 'pendiente')}
                      className="text-[9px] font-black uppercase bg-gray-50 px-3 py-2 rounded-xl text-gray-400 active:bg-gray-100"
                    >
                      {p.status === 'pendiente' ? '¿Entregado?' : 'Reabrir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTÓN PARA CREAR NUEVO (ESTILO FLOTANTE PARA TU DISEÑO) */}
            <button 
              onClick={() => setPaso('seleccion')}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-orange-500 text-white p-5 rounded-[2rem] font-black italic uppercase text-xs tracking-widest shadow-2xl shadow-orange-200 active:scale-95 transition-all flex justify-center items-center gap-3"
            >
              <span className="text-xl">+</span> Crear Nueva Orden
            </button>
          </section>
        )}

        {/* VISTA 2: TU DISEÑO DE SELECCIÓN DE PRODUCTOS */}
        {paso === 'seleccion' && (
          <>
            <section className="space-y-3">
              <h2 className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest text-left">Menú Disponible</h2>
              <div className="grid gap-3">
                {productos.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[1.8rem] border border-gray-100 flex justify-between items-center shadow-sm">
                    <div className="text-left flex-1">
                      <p className="text-[8px] font-black text-blue-500 uppercase leading-none mb-1">{p.brand}</p>
                      <h3 className="font-black text-gray-800 text-xs uppercase truncate w-32">{p.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold">C$ {p.price} <span className="ml-1 opacity-40 font-black">STK: {p.stock}</span></p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
                      <button onClick={() => ajustarCantidad(p.id, -1, p.stock)} className="w-8 h-8 bg-white rounded-xl shadow-sm font-bold text-gray-400 active:bg-gray-100">-</button>
                      <span className="font-black text-sm min-w-[20px] text-center">{carrito[p.id] || 0}</span>
                      <button onClick={() => ajustarCantidad(p.id, 1, p.stock)} className="w-8 h-8 bg-orange-500 rounded-xl shadow-sm font-bold text-white active:scale-90">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 border border-gray-100">
              <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-left">Información del Cliente</h2>
              <input 
                placeholder="NOMBRE DE QUIEN RECIBE *"
                value={form.cliente}
                onChange={e => setForm({...form, cliente: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-orange-500 border-none"
              />
              <input 
                type="tel"
                placeholder="TELÉFONO / WHATSAPP *"
                value={form.whatsapp}
                onChange={e => setForm({...form, whatsapp: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-orange-500 border-none"
              />
              <textarea 
                placeholder="DIRECCIÓN DE ENTREGA *"
                value={form.direccion}
                onChange={e => setForm({...form, direccion: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-orange-500 h-20 border-none"
              />
              <button 
                disabled={itemsSeleccionados.length === 0 || !form.cliente || !form.direccion || !form.whatsapp}
                onClick={() => setPaso('confirmacion')}
                className="w-full bg-gray-900 text-white p-5 rounded-2xl font-black italic uppercase text-[11px] tracking-widest disabled:opacity-20 active:scale-95 transition-all shadow-xl"
              >
                Revisar Pedido (C$ {subtotal})
              </button>
            </section>
          </>
        )}

        {/* VISTA 3: TU DISEÑO DE CONFIRMACIÓN */}
        {paso === 'confirmacion' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl italic font-black text-gray-900">OK</div>
              
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-4">Verificación Final</h2>
              
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2">
                {itemsSeleccionados.map(item => (
                  <div key={item.id} className="flex justify-between text-[11px] font-black uppercase border-b border-gray-50 pb-2">
                    <span className="text-gray-600">{carrito[item.id]}x {item.name}</span>
                    <span className="text-gray-900 italic">C$ {item.price * carrito[item.id]}</span>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 p-5 rounded-[2rem] mb-6 border border-orange-100">
                <p className="text-[9px] font-black text-orange-400 uppercase tracking-tighter">Entregar a:</p>
                <p className="font-black text-gray-800 text-sm">{form.cliente}</p>
                <p className="text-[10px] font-bold text-gray-600 mt-1">📞 {form.whatsapp}</p>
                <p className="text-[10px] font-bold text-gray-400 leading-tight mt-1 uppercase italic">{form.direccion}</p>
              </div>

              <div className="flex justify-between items-end mb-8 px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">Total Final:</span>
                <span className="text-3xl font-black italic text-gray-900 tracking-tighter">C$ {total}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaso('seleccion')}
                  className="bg-gray-100 text-gray-400 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95"
                >
                  Regresar
                </button>
                <button 
                  disabled={enviando}
                  onClick={handleFinalizarPedido}
                  className="bg-green-500 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95"
                >
                  {enviando ? 'Enviando...' : 'Todo Bien ✅'}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}