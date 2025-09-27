import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BrickWall, FlowerIcon, Gamepad2, Puzzle } from 'lucide-react'

const GAME_LIST = [
  {
    key: "/games/maze",
    link: "/games/maze",
    image: "/images/game_ico_maze.png",
    icon: <BrickWall size={24} />,
    label: "Labirin"
  },
  {
    key: "/games/maze",
    link: "/games/maze",
    image: "/images/game_ico_puzzle.png",
    icon: <Puzzle size={24} />,
    label: "Puzzle"
  },
  {
    key: "/games/flowchart",
    link: "/games/flowchart",
    image: "/images/game_ico_flowchart.png",
    icon: <FlowerIcon size={24} />,
    label: "Membuat Peta"
  },
]

export default function Page() {
  return (
    <div className="w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Gamepad2 />
          <h1 className={`text-2xl sm:text-3xl tracking-wide dark:text-white text-slate-900`}>
            Permainan Mengasah Logika
          </h1>
        </div>

        <div></div>
      </div>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
        {GAME_LIST.map((game) => (
          <Link key={game.key} href={game.link} className='hover:scale-105 duration-300'>
            <div className='flex flex-col gap-2 border shadow-sm p-2 rounded-lg'>
              <img
                src={game.image}
                className='w-full rounded-lg shadow-sm'
              />
              <h1 className='text-xl flex gap-1 items-center justify-center'>{game.icon} {game.label}</h1>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
