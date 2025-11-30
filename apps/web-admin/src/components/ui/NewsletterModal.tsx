// RUTA: apps/web-admin/src/components/ui/NewsletterModal.tsx
// VERSIÓN: 4.2 - Syntax Fix (Hotfix)
// DESCRIPCIÓN: Se corrige el error de sintaxis JSX en el botón de envío.
//              El comentario mal ubicado ha sido eliminado para permitir la compilación.

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { setCookie, getCookie } from 'cookies-next';
import {
  SiGoogle,
  SiApple,
  SiGithub,
  SiX,
} from '@icons-pack/react-simple-icons';

const COOKIE_NAME = 'newsletter_modal_seen';

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const pathname = usePathname();

  // Lógica de aparición automática (una vez por sesión/año)
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    const hasSeenModal = getCookie(COOKIE_NAME);

    // Si no ha visto el modal, lo mostramos tras 5 segundos de navegación
    if (!hasSeenModal) {
      timerId = setTimeout(() => setIsOpen(true), 5000);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleClose = () => {
    // Marcamos como visto por 1 año para no molestar
    setCookie(COOKIE_NAME, 'true', { maxAge: 60 * 60 * 24 * 365, path: '/' });
    setIsOpen(false);
    setFeedback(null);
  };

  // --- GESTIÓN DE OAUTH (GOOGLE, GITHUB, ETC) ---
  const handleOAuthLogin = async (provider: 'google' | 'github' | 'twitter' | 'apple' | 'facebook') => {
    setIsLoading(true);
    try {
      const origin = window.location.origin;
      // Construimos la URL de redirección inyectando los flags de rastreo
      // source=newsletter_modal: Le dice al callback que active la suscripción
      // next={pathname}: Devuelve al usuario a la página donde estaba
      const redirectTo = `${origin}/auth/callback?source=newsletter_modal&next=${pathname}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('OAuth Error:', error);
      setFeedback({ type: 'error', message: 'Error conectando con el proveedor.' });
      setIsLoading(false);
    }
  };

  // --- GESTIÓN DE MAGIC LINK (RESEND VÍA SUPABASE SMTP) ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const origin = window.location.origin;
      const emailRedirectTo = `${origin}/auth/callback?source=newsletter_modal&next=${pathname}`;

      // signInWithOtp envía un correo electrónico.
      // Si Supabase está configurado con Resend, este correo saldrá por la infraestructura de Resend.
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
          // Data adicional que se puede usar en los templates de email de Supabase
          data: {
            acquisition_source: 'newsletter_modal'
          }
        },
      });

      if (error) throw error;

      setFeedback({
        type: 'success',
        message: '¡Enlace enviado! Revisa tu correo (y spam) para confirmar.'
      });

    } catch (error) {
      console.error('Email Auth Error:', error);
      setFeedback({ type: 'error', message: 'No se pudo enviar el enlace. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            {/* Hero Image */}
            <div className="relative h-40 w-full">
              <Image
                src="/images/newsletter-bg.jpg"
                alt="Fondo abstracto de tecnología"
                fill
                className="object-cover opacity-80"
              />
              {/* bg-linear-to-b es la sintaxis correcta para Tailwind v4 */}
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-zinc-900" />
            </div>

            <div className="px-8 pb-8 pt-2 text-center">
              <h2 className="font-display text-2xl font-bold text-white">Únete al Ecosistema</h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Accede a contenido exclusivo, gana <span className="text-purple-400 font-bold">RazTokens</span> y desbloquea artefactos digitales registrándote ahora.
              </p>

              {/* OAuth Buttons Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm font-medium">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 p-2.5 text-white transition-colors hover:bg-zinc-700 border border-zinc-700/50 disabled:opacity-50"
                >
                  <SiGoogle size={18} /> Google
                </button>
                <button
                  onClick={() => handleOAuthLogin('github')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 p-2.5 text-white transition-colors hover:bg-zinc-700 border border-zinc-700/50 disabled:opacity-50"
                >
                  <SiGithub size={18} /> GitHub
                </button>
                <button
                  onClick={() => handleOAuthLogin('apple')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 p-2.5 text-white transition-colors hover:bg-zinc-700 border border-zinc-700/50 disabled:opacity-50"
                >
                  <SiApple size={18} /> Apple
                </button>
                <button
                  onClick={() => handleOAuthLogin('twitter')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 p-2.5 text-white transition-colors hover:bg-zinc-700 border border-zinc-700/50 disabled:opacity-50"
                >
                  <SiX size={18} /> X
                </button>
              </div>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px grow bg-zinc-800" />
                <span className="text-xs text-zinc-500 font-medium">O con tu email</span>
                <div className="h-px grow bg-zinc-800" />
              </div>

              {/* Email Form */}
              {feedback?.type === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg bg-green-900/20 border border-green-900/50 p-4 flex flex-col items-center gap-2"
                >
                  <CheckCircle className="text-green-500 h-8 w-8" />
                  <p className="text-sm text-green-200 font-medium">{feedback.message}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
                    <input
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 p-2.5 pl-10 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>

                  {feedback?.type === 'error' && (
                    <p className="text-xs text-red-400 text-left">{feedback.message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 p-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-purple-900/20"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Continuar con Email'}
                  </button>
                </form>
              )}

              <p className="mt-4 text-[10px] text-zinc-600">
                Al continuar, aceptas nuestra <a href="/legal/politica-de-privacidad" className="underline hover:text-zinc-400">Política de Privacidad</a>.
                Tus datos están protegidos por el Protocolo 33.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
