"use client";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import Link from 'next/link';
// IMPORTANTE: Importamos tu componente secundario
import ConfirmarPedido from '../ConfirmarPedido'; 

export default function RealizarPedido() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [negocioSeleccionado, setNegocioSeleccionado] = useState<any | null>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [carrito, setCarrito] = useState<{ [key: string]: number }>({});
  
  // ESTADO NUEVO: Para saber qué pantalla mostrar
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(false);

  useEffect(() => {
    const fetchNegociosActivos = async () => {
      const { data } = await supabase.from('businesses').select('*').eq('status', 'activo').order('name');
      if (data) setNegocios(data);
    };
    fetchNegociosActivos();
  }, []);

  useEffect(() => {
    if (negocioSeleccionado) {
      fetchProductos(negocioSeleccionado.id);
      setCarrito({}); 
    }
  }, [negocioSeleccionado]);

  const fetchProductos = async (businessId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'activo')
      .order('name', { ascending: true });
    if (data) setProductos(data);
    setLoading(false);
  };

  const ajustarCantidad = (productoId: string, cambio: number, stockDisponible: number) => {
    const cantidadActual = carrito[productoId] || 0;
    const nuevaCantidad = cantidadActual + cambio;
    if (nuevaCantidad < 0) return;
    if (nuevaCantidad > stockDisponible) {
      alert(`¡Atención! Solo quedan ${stockDisponible} unidades.`);
      return;
    }
    setCarrito({ ...carrito, [productoId]: nuevaCantidad });
  };

  const calcularTotal = () => {
    return productos.reduce((acc, p) => acc + ((carrito[p.id] || 0) * p.price), 0);
  };

  const totalItems = Object.values(carrito).reduce((a, b) => a + b, 0);

  // --- LÓGICA DE NAVEGACIÓN ---
  // Si el usuario dio clic en confirmar, mostramos el componente de detalles
  if (mostrandoConfirmacion) {
    return (
      <ConfirmarPedido 
        negocio={negocioSeleccionado}
        productos={productos}
        carritoInicial={carrito}
        onBack={() => setMostrandoConfirmacion(false)} // Función para regresar
      />
    );
  }

  // Si no, mostramos la lista de productos (Tu código original)
  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-32 text-gray-800">
      <div className="max-w-[450px] mx-auto space-y-4">
        <header className="flex items-center gap-4">
          <Link href="/" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">←</Link>
          <h1 className="text-xl font-bold">Ordenar Nuevo Pedido</h1>
        </header>

        {!negocioSeleccionado ? (
          <section className="space-y-3">
            {negocios.map((n) => (
              <button key={n.id} onClick={() => setNegocioSeleccionado(n)} className="w-full p-4 bg-white rounded-[2rem] flex items-center justify-between border border-white shadow-sm hover:border-orange-500 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🏪</span>
                  <p className="font-bold">{n.name}</p>
                </div>
                <span className="text-orange-500 font-bold">→</span>
              </button>
            ))}
          </section>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900 p-6 rounded-[2.5rem] text-white shadow-lg flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black opacity-50 tracking-widest">Pedido para</p>
                <h3 className="text-2xl font-black">{negocioSeleccionado.name}</h3>
              </div>
              <button onClick={() => setNegocioSeleccionado(null)} className="bg-white/10 p-2 px-4 rounded-xl text-xs font-bold">Cambiar</button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-gray-400 py-10">Cargando menú...</p>
              ) : (
                productos.map(p => (
                  <div key={p.id} className={`w-full bg-white p-4 rounded-2xl border transition-all flex justify-between items-center ${carrito[p.id] > 0 ? 'border-orange-500 shadow-md' : 'border-gray-100'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{p.packaging} • Stock: {p.stock}</p>
                      <p className="text-orange-600 font-black text-lg mt-1">C$ {p.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl">
                      <button onClick={() => ajustarCantidad(p.id, -1, p.stock)} className="w-10 h-10 bg-white rounded-xl shadow-sm text-red-500">−</button>
                      <span className="font-black">{carrito[p.id] || 0}</span>
                      <button onClick={() => ajustarCantidad(p.id, 1, p.stock)} className="w-10 h-10 bg-white rounded-xl shadow-sm text-green-600">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <div className="max-w-[450px] mx-auto bg-gray-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
            <div>
              <p className="text-2xl font-black">C$ {calcularTotal().toLocaleString()}</p>
              <p className="text-[10px] opacity-60">{totalItems} productos</p>
            </div>
            <button 
              onClick={() => setMostrandoConfirmacion(true)} // CAMBIO AQUÍ: Ahora cambia de pantalla
              className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}