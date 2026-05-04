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
  
  // Estados para Edición
  const [productoAEditar, setProductoAEditar] = useState<any | null>(null);
  const [formEdit, setFormEdit] = useState<any>(null);

  const opcionesEnvase = [
    "Lata", "Vidrio", "Caja", "Cajilla", "Sobre", "Paquete", 
    "Botella 8 onz", "Botella 12 onz", "Botella 250 ml", "Botella 500 ml", 
    "Botella 1 litro", "Botella 1.5 litro", "Botella 2 litros", "Botella 3 litros"
  ];

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
      .eq('status', 'activo')
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
      last_edited_by: 'SuperAdmin'
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

  const abrirEdicion = (producto: any) => {
    setProductoAEditar(producto);
    setFormEdit({ ...producto });
  };

  const cerrarEdicionConValidacion = () => {
    const hayCambios = JSON.stringify(productoAEditar) !== JSON.stringify(formEdit);
    if (hayCambios) {
      if (confirm("Tenés cambios sin guardar. ¿Estás seguro de que querés descartarlos?")) {
        setProductoAEditar(null);
      }
    } else {
      setProductoAEditar(null);
    }
  };

  const guardarCambios = async () => {
    if (!formEdit.name || !formEdit.price || !formEdit.stock || !formEdit.unit_price || !formEdit.units || !formEdit.packaging) {
      return alert("Por favor, completá todos los campos obligatorios (*)");
    }

    if (!confirm(`¿Estás seguro de guardar los cambios en ${formEdit.name}?`)) return;

    // Desestructuramos para no enviar campos de sistema que puedan dar error
    const { id, created_at, ...datosAActualizar } = formEdit;

    const { error } = await supabase
      .from('menu_items')
      .update({
        ...datosAActualizar,
        last_edited_by: 'SuperAdmin',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      // Actualización local para evitar parpadeos
      setProductos(prev => prev.map(p => p.id === id ? { ...p, ...datosAActualizar } : p));
      alert("Producto actualizado correctamente");
      setProductoAEditar(null);
    }
  };

  const handleEliminarProducto = async () => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${productoAEditar.name}"?`)) return;

    const idEliminar = productoAEditar.id;

    const { error } = await supabase
      .from('menu_items')
      .update({ 
        status: 'inactivo', 
        last_edited_by: 'SuperAdmin',
        updated_at: new Date().toISOString() 
      })
      .eq('id', idEliminar);

    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      setProductos(prev => prev.filter(p => p.id !== idEliminar));
      alert("Producto eliminado del catálogo");
      setProductoAEditar(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24 text-gray-800">
      <div className="max-w-[450px] mx-auto space-y-4">
        
        <header className="flex items-center gap-4">
          <Link href="/" className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">←</Link>
          <h1 className="text-xl font-bold">Catálogo de Menú</h1>
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
                  <p className="font-bold">{n.name}</p>
                </div>
                <span className="text-orange-500 font-bold">→</span>
              </button>
            ))}
          </section>
        ) : (
          <div className="space-y-4">
            {/* Banner del Negocio */}
            <div className="bg-orange-500 p-6 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden">
              <p className="text-[10px] uppercase font-black opacity-70 tracking-widest">Gestionando menú</p>
              <h3 className="text-2xl font-black">{negocioSeleccionado.name}</h3>
              <button onClick={() => setNegocioSeleccionado(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-xs font-bold">Cambiar</button>
            </div>

            {/* Tabs de Navegación */}
            <div className="flex bg-gray-200/50 p-1 rounded-2xl">
              <button onClick={() => setVista('lista')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${vista === 'lista' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>Ver Todo</button>
              <button onClick={() => setVista('agregar')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${vista === 'agregar' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>+ Agregar</button>
            </div>

            {vista === 'lista' ? (
              <div className="space-y-3">
                {loading ? <p className="text-center text-gray-400">Cargando...</p> : 
                  productos.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => abrirEdicion(p)}
                    className="w-full bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center text-left active:scale-[0.98] transition-transform shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{p.packaging} {p.brand ? `• ${p.brand}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600 text-lg">C$ {p.price}</p>
                      {p.stock <= 0 ? (
                        <span className="text-[9px] bg-red-100 text-red-600 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">Sin Stock</span>
                      ) : (
                        <p className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500 inline-block">Stock: {p.stock}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleAgregarProducto} className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4">
                <div className="grid gap-4">
                  <input name="nombre" required placeholder="Nombre del producto *" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input name="marca" placeholder="Marca (Ej: Coca-Cola)" className="p-4 bg-gray-50 rounded-2xl outline-none" />
                    <input name="sabor" placeholder="Sabor / Variedad" className="p-4 bg-gray-50 rounded-2xl outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input name="precio" type="number" step="0.01" required placeholder="Precio Venta *" className="p-4 bg-gray-50 rounded-2xl outline-none" />
                    <input name="stock" type="number" required placeholder="Stock Inicial *" className="p-4 bg-gray-50 rounded-2xl outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input name="precioUnitario" type="number" step="0.01" required placeholder="Precio Unit. *" className="p-4 bg-gray-50 rounded-2xl outline-none" />
                    <input name="unidades" type="number" required placeholder="Unidades *" className="p-4 bg-gray-50 rounded-2xl outline-none" />
                  </div>

                  <select name="envase" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-gray-500">
                    <option value="">Seleccioná Envase *</option>
                    {opcionesEnvase.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-gray-900 text-white p-5 rounded-2xl font-bold active:scale-95 transition-all shadow-xl">Guardar en Catálogo</button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {productoAEditar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full max-w-[500px] mx-auto rounded-t-[3rem] p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" onClick={cerrarEdicionConValidacion} />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold">Editar Producto</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
                Editor: <span className="text-orange-500">{productoAEditar.last_edited_by || 'Sistema'}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Nombre del Item *</label>
                <input 
                  value={formEdit.name} 
                  onChange={(e) => setFormEdit({...formEdit, name: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Precio Venta *</label>
                  <input 
                    type="number" 
                    value={formEdit.price} 
                    onChange={(e) => setFormEdit({...formEdit, price: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Stock Actual *</label>
                  <input 
                    type="number" 
                    value={formEdit.stock} 
                    onChange={(e) => setFormEdit({...formEdit, stock: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Envase / Presentación *</label>
                <select 
                  value={formEdit.packaging} 
                  onChange={(e) => setFormEdit({...formEdit, packaging: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium"
                >
                  {opcionesEnvase.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Marca" 
                  value={formEdit.brand || ''} 
                  onChange={(e) => setFormEdit({...formEdit, brand: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                />
                <input 
                  placeholder="Sabor" 
                  value={formEdit.flavor || ''} 
                  onChange={(e) => setFormEdit({...formEdit, flavor: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <button onClick={cerrarEdicionConValidacion} className="flex-1 bg-gray-100 text-gray-500 p-5 rounded-2xl font-bold active:scale-95 transition-all">Descartar</button>
                <button onClick={guardarCambios} className="flex-2 bg-orange-500 text-white p-5 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-orange-200">Guardar Cambios</button>
              </div>
              
              <button onClick={handleEliminarProducto} className="w-full bg-red-50 text-red-500 p-4 rounded-2xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-100">
                🗑️ Eliminar del Catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}