"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        // Aquí podrías consultar el rol si quisieras ser más específico
        router.push('/admin');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">
        Verificando sesión...
      </p>
    </div>
  );
}