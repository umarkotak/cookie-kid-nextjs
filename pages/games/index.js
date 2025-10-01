import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BrickWall, FlowerIcon, Gamepad2, GlassWater, LandPlot, Puzzle } from 'lucide-react'

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
  {
    key: "/games/golf",
    link: "/games/golf",
    image: "/images/game_ico_flappybird.png",
    icon: <LandPlot size={24} />,
    label: "Golf"
  },
  {
    key: "/games/happy-glass",
    link: `https://5cac4523-71ea-476e-8acc-a6cb9c25cc06.poki-gdn.com/2719f5f7-a059-44f1-860d-2e8e1c70b9fd/index.html?country=ID&ccpaApplies=0&url_referrer=https%3A%2F%2Fpoki.com%2F&tag=pg-ac4e68e34b97424608f5f2170b1a77c9559f8393&site_id=74&iso_lang=id&poki_url=https%3A%2F%2Fpoki.com%2Fid%2Fg%2Fhappy-glass&hoist=yes&nonPersonalized=n&cloudsavegames=n&familyFriendly=n&categories=7%2C34%2C37%2C72%2C400%2C1013%2C1140%2C1143%2C1190&special_condition=landing&game_id=5cac4523-71ea-476e-8acc-a6cb9c25cc06&game_version_id=2719f5f7-a059-44f1-860d-2e8e1c70b9fd&inspector=0&csp=1","onPoki":true,"onKids":false,"isLocal":false,"gameID":"5cac4523-71ea-476e-8acc-a6cb9c25cc06`,
    image: "/images/game_ico_car.png",
    icon: <GlassWater size={24} />,
    label: "Bantu Mengisi Air",
    mode: "external",
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
          game.mode === "external"
          ? <a key={game.key} href={game.link} className='hover:scale-105 duration-300' rel={"noopener noreferrer"}>
            <div className='flex flex-col gap-2 border shadow-sm p-2 rounded-lg'>
              <img
                src={game.image}
                className='w-full rounded-lg shadow-sm'
              />
              <h1 className='text-xl flex gap-1 items-center justify-center'>{game.icon} {game.label}</h1>
            </div>
          </a>
          : <Link key={game.key} href={game.link} className='hover:scale-105 duration-300'>
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
