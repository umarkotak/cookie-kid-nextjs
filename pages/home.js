'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { BookIcon, Brain, CheckCheck, Heart, Joystick, NotebookPen, Puzzle, Tv } from 'lucide-react';
import ActivityBar from '@/components/ActivityBar';

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
    <div className="w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className={`text-2xl sm:text-3xl tracking-wide dark:text-white text-slate-900`}>
            Selamat Datang Di CaBocil! 👋
          </h1>
        </div>

        <div></div>
      </div>

      <div className='mb-8'>
        <ActivityBar />
      </div>

      {/* Menu Cards */}
      <div className='mb-8'>
        <div className='flex justify-between items-center mb-3'>
          <span className={`text-2xl flex items-center gap-2`}>
            <CheckCheck />
            Menu
          </span>
          {/* <Link href="/activity">
            <Button size="sm" variant="outline">semua aktivitas</Button>
          </Link> */}
        </div>

        <div className="flex flex-wrap gap-6">
          <MenuCard
            href="/tv"
            label="TV Anak"
            emoji={<Tv size={26} />}
            gradient="from-fuchsia-500 via-rose-400 to-amber-300"
            isDark={isDark}
            blurb="Kartun dan video untuk anak anak."
          />

          <MenuCard
            href="/books"
            label="Buku Anak"
            emoji={<BookIcon size={26} />}
            gradient="from-sky-500 via-cyan-400 to-emerald-300"
            isDark={isDark}
            blurb="Kisah dan petualangan untuk dibaca."
          />

          <MenuCard
            href="/workbooks"
            label="Lembar Kerja"
            emoji={<NotebookPen size={26} />}
            gradient="from-violet-500 via-indigo-400 to-blue-300"
            isDark={isDark}
            blurb="Latihan dan soal soal untuk dikerjakan."
          />

          <MenuCard
            href="/games"
            label="Permainan"
            emoji={<Joystick size={26} />}
            gradient="from-violet-500 via-yellow-400 to-amber-300"
            isDark={isDark}
            blurb="Permainan untuk melatih logika anak."
          />
        </div>
      </div>

      <footer className="flex items-center justify-center gap-2 text-sm">
        <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Made with</span>
        <span aria-hidden><Heart className='text-red-500' size={16} /></span>
        <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>for your kids</span>
      </footer>
    </div>
  )
}

function MenuCard({ href, label, emoji, gradient, isDark, blurb }) {
  return (
    <Link href={href} className="group">
      <div
        className={`relative h-36 w-36 rounded-3xl p-4 shadow-xl transition-all active:scale-[0.99] hover:scale-[1.03] overflow-hidden border ${
          isDark
            ? 'bg-slate-800 border-white/10 hover:bg-slate-700'
            : 'bg-white/70 border-white hover:bg-white'
        }`}
      >
        <div className={`absolute -top-16 -right-16 h-32 w-32 rotate-45 rounded-3xl blur-2xl opacity-70 bg-gradient-to-br ${gradient}`} />

        <div className="relative flex flex-col h-full items-center justify-center">
          <div>{emoji}</div>
          <h3 className={`text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</h3>
        </div>
      </div>
    </Link>
  )
}
