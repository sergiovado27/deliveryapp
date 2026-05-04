"use client";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import Link from 'next/link';

export default function GestionMenu() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [negocioSeleccionado, setNegocioSeleccionado] = useState<any | null>(null);
  const [vista, setVista] = useState<'lista' | 'agregar'>('lista');
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar solo negocios activos
  useEffect(() => {
    const fetchNegociosActivos = async () => {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'activo')
        .order('name');
      if (data) setNegocios(data);
    };
    fetchNegociosActivos();
  }, []);

  // 2. Cargar productos cuando se selecciona un negocio
  useEffect(() => {
    if (negocioSeleccionado) {
      fetchProductos(negocioSeleccionado.id);
    }
  }, [negocioSeleccionado]);

  const fetchProductos = async (businessId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (data) setProductos(data);
    setLoading(false);
  };

  const handleAgregarProducto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const nuevoProducto = {
      business_id: negocioSeleccionado.id,
      name: formData.get('nombre'),
      price: parseFloat(formData.get('precio') as string),
      stock: parseInt(formData.get('stock') as string),
      unit_price: parseFloat(formData.get('precioUnitario') as string),
      units: parseInt(formData.get('unidades') as string),
      packaging: formData.get('envase'),
      brand: formData.get('marca') || null,
      flavor: formData.get('sabor') || null,
    };

    const { error } = await supabase.from('menu_items').insert([nuevoProducto]);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("Producto agregado con éxito");
      fetchProductos(negocioSeleccionado.id);
      setVista('lista');
    }
  };

  const opcionesEnvase = [
    "Lata", "Vidrio", "Caja", "Cajilla", "Sobre", 
    "Botella 8 onz", "Botella 12 onz", "Botella 250 ml", "Botella 500 ml", 
    "Botella 1 litro", "Botella 1.5 litro", "Botella 2 litros", "Botella 3 litros"
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[450px] mx-auto space-y-4">
        
        <header className="flex items-center gap-4">
          <Link href="/" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">←</Link>
          <h1 className="text-xl font-bold text-gray-800">Catálogo de Menú</h1>
        </header>

        {!negocioSeleccionado ? (
          <section className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase ml-2">Selecciona un comercio</p>
            {negocios.map((n) => (
              <button 
                key={n.id} 
                onClick={() => setNegocioSeleccionado(n)}
                className="w-full p-4 bg-white rounded-[2rem] flex items-center justify-between border border-white shadow-sm hover:border-orange-500 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🏪</span>
                  <p className="font-bold text-gray-800">{n.name}</p>
                </div>
                <span className="text-orange-500 font-bold">→</span>
              </button>
            ))}
          </section>
        ) : (
          <div className="space-y-4">
            {/* Banner del Negocio */}
            <div className="bg-orange-500 p-6 rounded-[2.5rem] text-white shadow-lg shadow-orange-100 relative overflow-hidden">
              <p className="text-[10px] uppercase font-black opacity-70 tracking-widest">Gestionando menú</p>
              <h3 className="text-2xl font-black">{negocioSeleccionado.name}</h3>
              <button onClick={() => setNegocioSeleccionado(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-xs">Cambiar</button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-200/50 p-1 rounded-2xl">
              <button onClick={() => setVista('lista')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${vista === 'lista' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>Ver Todo</button>
              <button onClick={() => setVista('agregar')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${vista === 'agregar' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>+ Agregar</button>
            </div>

            {vista === 'lista' ? (
              <div className="space-y-3">
                {loading ? <p className="text-center text-gray-400">Cargando...</p> : 
                 productos.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{p.packaging} {p.brand ? `• ${p.brand}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600 text-lg">C$ {p.price}</p>
                      <p className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500">Stock: {p.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleAgregarProducto} className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4">
                <div className="grid gap-4">
                  <input name="nombre" required placeholder="Nombre del producto *" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input name="precio" type="number" step="0.01" required placeholder="Precio Venta *" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none" />
                    <input name="stock" type="number" required placeholder="Stock Inicial *" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input name="precioUnitario" type="number" step="0.01" required placeholder="Precio Unit. *" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none" />
                    <input name="unidades" type="number" required placeholder="Unidades *" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>

                  <select name="envase" required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none text-gray-500">
                    <option value="">Seleccioná Envase *</option>
                    {opcionesEnvase.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <input name="marca" placeholder="Marca (Opcional)" className="p-4 bg-gray-50 rounded-2xl border-none outline-none" />
                    <input name="sabor" placeholder="Sabor (Opcional)" className="p-4 bg-gray-50 rounded-2xl border-none outline-none" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white p-5 rounded-2xl font-bold active:scale-95 transition-all">
                  Guardar en Catálogo
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
  
}