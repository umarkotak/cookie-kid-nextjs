'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Heart } from 'lucide-react';

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(true);

  // apply theme to <html>
  useEffect(() => {
    setIsDark(resolvedTheme === 'dark');
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else if (resolvedTheme === 'light') {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [resolvedTheme])

  return (
    <main className={`min-h-[calc(100vh-70px)] overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-pink-100 via-sky-100 to-emerald-100'}`}>
      {/* Background decorative shapes */}
      <Bubbles isDark={isDark} />

      <img
        src="/images/char1.png"
        alt="Friendly character"
        className="hidden md:block pointer-events-none select-none absolute bottom-0 left-44 w-40 sm:w-56 lg:w-64 drop-shadow-xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🪄</span>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Halo Teman Petualang! 👋
            </h1>
          </div>

          <div></div>
        </header>

        <p className={`mt-3 text-lg sm:text-xl max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Pick a world to jump into. Watch fun shows, read cozy books, or play with workbooks!
        </p>

        {/* Menu Cards */}
        <nav aria-label="Main" className="sm:ml-48 md:ml-52 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MenuCard
            href="/tv"
            label="TV Time"
            emoji="📺"
            gradient="from-fuchsia-500 via-rose-400 to-amber-300"
            isDark={isDark}
            blurb="Cartoons and shows for kids."
          />

          <MenuCard
            href="/books"
            label="Book Nook"
            emoji="📚"
            gradient="from-sky-500 via-cyan-400 to-emerald-300"
            isDark={isDark}
            blurb="Stories and adventures to read."
          />

          <MenuCard
            href="/workbooks"
            label="Workbooks"
            emoji="🧩"
            gradient="from-violet-500 via-indigo-400 to-blue-300"
            isDark={isDark}
            blurb="Puzzles and practice pages."
          />
        </nav>

        {/* Helpful footer */}
        <section className="sm:ml-48 md:ml-52 mt-12">
          <div className={`rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white'} `}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tips for grown‑ups</h2>
            <ul className={`mt-3 list-disc pl-6 space-y-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li>Use the 🌙/☀️ button to switch themes.</li>
              <li>Cards are large and friendly for little hands on tablets and phones.</li>
              <li>All pages keep the same header for a consistent feel.</li>
            </ul>
          </div>
        </section>

        <footer className="mt-10 flex items-center justify-center gap-2 text-sm">
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Made with</span>
          <span aria-hidden><Heart className='text-red-500' size={16} /></span>
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>for your kids</span>
        </footer>
      </div>
    </main>
  )
}

function MenuCard({ href, label, emoji, gradient, isDark, blurb }) {
  return (
    <Link href={href} className="group">
      <div
        className={`relative h-44 sm:h-48 rounded-3xl p-5 shadow-xl transition-all active:scale-[0.99] overflow-hidden border ${
          isDark
            ? 'bg-slate-800 border-white/10 hover:bg-slate-700'
            : 'bg-white/70 border-white hover:bg-white'
        }`}
      >
        {/* colorful ribbon */}
        <div className={`absolute -top-16 -right-16 h-40 w-40 rotate-45 rounded-3xl blur-2xl opacity-70 bg-gradient-to-br ${gradient}`} />

        <div className="relative z-10 flex h-full items-start justify-between">
          <div>
            <div className="text-4xl" aria-hidden>{emoji}</div>
            <h3 className={`mt-3 text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{blurb}</p>
          </div>

          <span
            className={`self-end rounded-full px-3 py-1 text-xs font-bold tracking-wide transition-transform group-hover:translate-x-1 ${
              isDark ? 'bg-white/10 text-white' : 'bg-slate-900/5 text-slate-700'
            }`}
          >
            Start →
          </span>
        </div>
      </div>
    </Link>
  )
}

function Bubbles({ isDark }) {
  // purely decorative bubbles
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <div className={`absolute -left-10 -top-10 h-56 w-56 rounded-full mix-blend-multiply blur-3xl opacity-30 ${isDark ? 'bg-sky-400/30' : 'bg-pink-300'}`} />
      <div className={`absolute right-0 top-24 h-72 w-72 rounded-full mix-blend-multiply blur-3xl opacity-30 ${isDark ? 'bg-fuchsia-400/30' : 'bg-yellow-300'}`} />
      <div className={`absolute -bottom-10 left-20 h-64 w-64 rounded-full mix-blend-multiply blur-3xl opacity-30 ${isDark ? 'bg-emerald-400/30' : 'bg-sky-300'}`} />
    </div>
  )
}
