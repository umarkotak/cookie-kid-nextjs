'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { BookIcon, Heart, Joystick, Puzzle, Tv } from 'lucide-react';

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
    <main className={`min-h-[calc(100vh-48px)] overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-pink-100 via-sky-100 to-emerald-100'}`}>
      {/* Background decorative shapes */}
      <Bubbles isDark={isDark} />

      {/* <img
        src="/images/char1.png"
        alt="Friendly character"
        className="hidden md:block pointer-events-none select-none absolute bottom-0 left-44 w-40 sm:w-56 lg:w-64 drop-shadow-xl"
      /> */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Halo Teman Teman! 👋
            </h1>
          </div>

          <div></div>
        </header>

        <p className={`mb-8 text-lg sm:text-xl max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Selamat datang di cabocil.com, silahkan pilih aktivitas yang ingin kamu lakukan hari ini!
        </p>

        {/* Menu Cards */}
        <nav aria-label="Main" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MenuCard
            href="/tv"
            label="Televisi Anak"
            emoji={<Tv size={40} />}
            gradient="from-fuchsia-500 via-rose-400 to-amber-300"
            isDark={isDark}
            blurb="Kartun dan video untuk anak anak."
          />

          <MenuCard
            href="/books"
            label="Waktunya Membaca"
            emoji={<BookIcon size={40} />}
            gradient="from-sky-500 via-cyan-400 to-emerald-300"
            isDark={isDark}
            blurb="Kisah dan petualangan untuk dibaca."
          />

          <MenuCard
            href="/workbooks"
            label="Belajar dan Berlatih"
            emoji={<Puzzle size={40} />}
            gradient="from-violet-500 via-indigo-400 to-blue-300"
            isDark={isDark}
            blurb="Latihan dan soal soal untuk dikerjakan."
          />

          <MenuCard
            href="/games"
            label="Permainan Seru"
            emoji={<Joystick size={40} />}
            gradient="from-violet-500 via-indigo-400 to-blue-300"
            isDark={isDark}
            blurb="Permainan untuk melatih logika anak."
          />
        </nav>

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
            <div className="" aria-hidden>{emoji}</div>
            <h3 className={`mt-3 text-2xl sm:text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{blurb}</p>
          </div>
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
