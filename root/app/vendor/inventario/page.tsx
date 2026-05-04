"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [vista, setVista] = useState<'lista' | 'agregar'>('lista');
  
  // Estados para Edición
  const [productoAEditar, setProductoAEditar] = useState<any | null>(null);
  const [formEdit, setFormEdit] = useState<any>(null);

  const router = useRouter();

  const opcionesEnvase = [
    "Lata", "Vidrio", "Caja", "Cajilla", "Sobre", "Paquete", 
    "Botella 8 onz", "Botella 12 onz", "Botella 250 ml", "Botella 500 ml", 
    "Botella 1 litro", "Botella 1.5 litro", "Botella 2 litros", "Botella 3 litros"
  ];

  const fetchInventory = useCallback(async (bid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', bid)
      .eq('status', 'activo') // Solo activos en la lista principal
      .order('created_at', { ascending: false });

    if (!error) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
        if (profile?.business_id) {
          setBusinessId(profile.business_id);
          fetchInventory(profile.business_id);
        }
      }
    };
    loadData();
  }, [fetchInventory]);

  const handleAgregarProducto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const nuevoProducto = {
      business_id: businessId,
      name: (formData.get('nombre') as string).toUpperCase(),
      brand: (formData.get('marca') as string || 'GENÉRICO').toUpperCase(),
      flavor: (formData.get('sabor') as string || null)?.toUpperCase(),
      price: parseFloat(formData.get('precio') as string),
      stock: parseInt(formData.get('stock') as string),
      unit_price: parseFloat(formData.get('precioUnitario') as string),
      units: parseInt(formData.get('unidades') as string),
      packaging: formData.get('envase'),
      status: 'activo',
      last_edited_by: 'Vendor'
    };

    const { error } = await supabase.from('menu_items').insert([nuevoProducto]);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("Producto agregado con éxito");
      if (businessId) fetchInventory(businessId);
      setVista('lista');
    }
  };

  const abrirEdicion = (producto: any) => {
    setProductoAEditar(producto);
    setFormEdit({ ...producto });
  };

  const guardarCambios = async () => {
    if (!formEdit.name || !formEdit.price || !formEdit.stock) {
      return alert("Por favor, completá los campos obligatorios");
    }

    const { id, created_at, updated_at, ...datosAActualizar } = formEdit;

    const { error } = await supabase
      .from('menu_items')
      .update({
        ...datosAActualizar,
        name: datosAActualizar.name.toUpperCase(),
        brand: datosAActualizar.brand?.toUpperCase(),
        last_edited_by: 'Vendor',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      alert("Actualizado correctamente");
      setItems(prev => prev.map(p => p.id === id ? { ...p, ...datosAActualizar } : p));
      setProductoAEditar(null);
    }
  };

  const handleDarDeBaja = async () => {
    if (!confirm(`¿Estás seguro de dar de baja a "${productoAEditar.name}"?`)) return;

    const { error } = await supabase
      .from('menu_items')
      .update({ 
        status: 'inactivo', 
        last_edited_by: 'Vendor',
        updated_at: new Date().toISOString() 
      })
      .eq('id', productoAEditar.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setItems(prev => prev.filter(p => p.id !== productoAEditar.id));
      setProductoAEditar(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24 flex flex-col items-center">
      <div className="w-full max-w-[400px] space-y-4">
        
        <header className="flex items-center gap-4 py-2">
          <button onClick={() => router.back()} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">←</button>
          <h1 className="text-xl font-black italic uppercase">Inventario</h1>
        </header>

        {/* Tabs de Navegación Estilo Admin */}
        <div className="flex bg-gray-200/50 p-1 rounded-2xl">
          <button onClick={() => setVista('lista')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${vista === 'lista' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}>Ver Todo</button>
          <button onClick={() => setVista('agregar')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${vista === 'agregar' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}>+ Agregar</button>
        </div>

        {vista === 'lista' ? (
          <div className="space-y-3">
            {loading ? <p className="text-center text-[10px] font-black uppercase text-gray-400 mt-10">Cargando...</p> : 
              items.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => abrirEdicion(p)}
                  className="w-full bg-white p-5 rounded-[2rem] border border-gray-100 flex justify-between items-center text-left active:scale-[0.98] transition-transform shadow-sm"
                >
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-blue-500 uppercase">{p.brand || 'GENÉRICO'}</p>
                    <p className="font-black text-gray-800 text-sm uppercase leading-tight">{p.name}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold mt-1">{p.packaging} {p.flavor ? `• ${p.flavor}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-lg tracking-tighter uppercase">C$ {p.price}</p>
                    <p className="text-[9px] bg-gray-100 px-2 py-0.5 rounded-md font-black text-gray-500 inline-block uppercase">Stock: {p.stock}</p>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <form onSubmit={handleAgregarProducto} className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="space-y-3">
              <input name="nombre" required placeholder="NOMBRE DEL PRODUCTO *" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase placeholder:text-gray-300" />
              
              <div className="grid grid-cols-2 gap-3">
                <input name="marca" placeholder="MARCA" className="p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase" />
                <input name="sabor" placeholder="SABOR" className="p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Precio Venta</label>
                  <input name="precio" type="number" step="0.01" required placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Stock Inicial</label>
                  <input name="stock" type="number" required placeholder="0" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Costo Unit.</label>
                  <input name="precioUnitario" type="number" step="0.01" required placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Cant. Unid.</label>
                  <input name="unidades" type="number" required placeholder="1" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black" />
                </div>
              </div>

              <select name="envase" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase text-gray-500 appearance-none">
                <option value="">SELECCIONÁ ENVASE *</option>
                {opcionesEnvase.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Guardar en Inventario</button>
          </form>
        )}
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {productoAEditar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full max-w-[400px] mx-auto rounded-t-[3rem] p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" onClick={() => setProductoAEditar(null)} />
            
            <div className="text-center">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Editar Producto</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Nombre del Item</label>
                <input 
                  value={formEdit.name} 
                  onChange={(e) => setFormEdit({...formEdit, name: e.target.value.toUpperCase()})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Precio Venta</label>
                  <input type="number" value={formEdit.price} onChange={(e) => setFormEdit({...formEdit, price: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Stock</label>
                  <input type="number" value={formEdit.stock} onChange={(e) => setFormEdit({...formEdit, stock: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 ml-2 uppercase">Envase / Presentación</label>
                <select 
                  value={formEdit.packaging} 
                  onChange={(e) => setFormEdit({...formEdit, packaging: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase appearance-none"
                >
                  {opcionesEnvase.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="MARCA" value={formEdit.brand || ''} onChange={(e) => setFormEdit({...formEdit, brand: e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase" />
                <input placeholder="SABOR" value={formEdit.flavor || ''} onChange={(e) => setFormEdit({...formEdit, flavor: e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase" />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <button onClick={() => setProductoAEditar(null)} className="flex-1 bg-red-50 text-red-600 border border-red-100 p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Cancelar</button>
                <button onClick={guardarCambios} className="flex-1 bg-blue-600 text-white p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-100">Guardar</button>
              </div>
              <button onClick={handleDarDeBaja} className="w-full p-4 text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] hover:text-red-500 transition-colors">
                🗑️ Dar de baja producto
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}