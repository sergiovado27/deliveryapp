"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // 1. Obtenemos la sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Si no hay sesión, al login
        router.push('/login');
      } else {
        // 2. Si hay sesión, consultamos el perfil para saber el ROL
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          // Si hay error buscando el perfil, mejor mandarlo al login por seguridad
          router.push('/login');
          return;
        }

        // 3. Redireccionamos según el rol guardado en la base de datos
        if (profile.role === 'admin') {
          router.push('/admin');
        } else if (profile.role === 'vendedor') {
          router.push('/ordenes'); // Tu nueva página de vendedor
        } else {
          // En caso de otros roles (ej. rider), o por defecto
          router.push('/login');
        }
      }
    };
    
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">
          Verificando Credenciales
        </p>
        <div className="w-12 h-1 bg-gray-100 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 w-1/2 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}