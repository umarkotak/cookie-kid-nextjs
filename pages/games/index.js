import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BirdIcon, BookOpen, BotMessageSquare, BrickWall, CarIcon, Circle, FlowerIcon, MessageCircleQuestion, Puzzle, Worm, WormIcon,  } from 'lucide-react'

import ytkiddAPI from '@/apis/ytkidApi'
import Utils from '@/models/Utils'

export default function Home() {
  const searchParams = useSearchParams()

  return (
    <main className="pb-[100px] p-4">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
        <Link href="/games/maze" className='hover:scale-105 duration-300'>
          <div className='flex flex-col gap-2 border shadow-sm p-2 rounded-lg'>
            <img
              src="/images/game_ico_maze.png"
              className='w-full rounded-lg shadow-sm'
            />
            <h1 className='text-xl flex gap-1 items-center justify-center'><BrickWall size={24} /> Labirin</h1>
          </div>
        </Link>
        <Link href="/games/puzzle" className='hover:scale-105 duration-300'>
          <div className='flex flex-col gap-2 border shadow-sm p-2 rounded-lg'>
            <img
              src="/images/game_ico_puzzle.png"
              className='w-full rounded-lg shadow-sm'
            />
            <h1 className='text-xl flex gap-1 items-center justify-center'><Puzzle size={24} /> Puzzle</h1>
          </div>
        </Link>
        <Link href="/games/flowchart" className='hover:scale-105 duration-300'>
          <div className='flex flex-col gap-2 border shadow-sm p-2 rounded-lg'>
            <img
              src="/images/game_ico_flowchart.png"
              className='w-full rounded-lg shadow-sm'
            />
            <h1 className='text-xl flex gap-1 items-center justify-center'><FlowerIcon size={24} /> Membuat Peta</h1>
          </div>
        </Link>
      </div>
    </main>
  )
}
