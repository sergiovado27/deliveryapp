"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Verificar si hay sesión
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Verificar si el perfil tiene rol de admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        // Si no es admin, lo expulsamos (puedes mandarlo a /ordenes o al login)
        router.push('/login'); 
      } else {
        // Si es admin, permitimos ver el contenido
        setAuthorized(true);
      }
    };

    checkAdmin();
  }, [router]);

  // Mientras verifica, no mostramos NADA (evita el "parpadeo" del contenido prohibido)
  if (!authorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">
          Acceso Restringido...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}