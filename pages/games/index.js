import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BoltIcon, BrickWall, Calculator, CarIcon, CatIcon, FlowerIcon, Gamepad2, GlassWater, HouseIcon, LandPlot, Puzzle, StickerIcon, UserRoundCogIcon, UsersRoundIcon } from 'lucide-react'

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
    image: "/images/game_ico_golf.png",
    icon: <LandPlot size={24} />,
    label: "Golf"
  },
  {
    key: "/games/happy-glass",
    link: `https://5cac4523-71ea-476e-8acc-a6cb9c25cc06.poki-gdn.com/2719f5f7-a059-44f1-860d-2e8e1c70b9fd/index.html?country=ID&ccpaApplies=0&url_referrer=https%3A%2F%2Fpoki.com%2F&tag=pg-ac4e68e34b97424608f5f2170b1a77c9559f8393&site_id=74&iso_lang=id&poki_url=https%3A%2F%2Fpoki.com%2Fid%2Fg%2Fhappy-glass&hoist=yes&nonPersonalized=n&cloudsavegames=n&familyFriendly=n&categories=7%2C34%2C37%2C72%2C400%2C1013%2C1140%2C1143%2C1190&special_condition=landing&game_id=5cac4523-71ea-476e-8acc-a6cb9c25cc06&game_version_id=2719f5f7-a059-44f1-860d-2e8e1c70b9fd&inspector=0&csp=1","onPoki":true,"onKids":false,"isLocal":false,"gameID":"5cac4523-71ea-476e-8acc-a6cb9c25cc06`,
    image: "/images/game_ico_water.png",
    icon: <GlassWater size={24} />,
    label: "Isi Air",
    mode: "external",
  },
  {
    key: "/games/level-devil",
    link: `https://13acae8c-ec6a-4823-b1a2-8ea20cea56e7.poki-gdn.com/28edc61e-5dd6-478a-a970-edee95166353/index.html`,
    image: "/images/game_ico_rintangan.png",
    icon: <UsersRoundIcon size={24} />,
    label: "Rintangan",
    mode: "external",
  },
  {
    key: "/games/sticker-puzzle",
    link: `https://bab7ec00-983f-439a-b675-651d7ec0d929.poki-gdn.com/9e742cc1-656c-4a44-8434-f587cbda16f7/index.html`,
    image: "/images/game_ico_sticker.png",
    icon: <StickerIcon size={24} />,
    label: "Tempel Sticker",
    mode: "external",
  },
  {
    key: "/games/mine-fun",
    link: `https://c89f4abe-5041-497b-8705-986b6f3b748c.poki-gdn.com/ba4762ff-008e-4bdf-a664-2412b2699f4a/index.html`,
    image: "/images/game_ico_parkour.png",
    icon: <UserRoundCogIcon size={24} />,
    label: "Parkour",
    mode: "external",
  },
  {
    key: "/games/drive-mad",
    link: `https://f9564e4e-ef25-4e4b-ba67-cb11a1576bbd.poki-gdn.com/d2d1c9d9-8f98-450b-9eee-0d612f13b315/index.html`,
    image: "/images/game_ico_mobilmuter.png",
    icon: <CarIcon size={24} />,
    label: "Mobilan",
    mode: "external",
  },
  {
    key: "/games/aritmathic",
    link: `https://5947565b-1eae-4602-9e05-690e54616659.poki-gdn.com/117b8be4-5bb5-46eb-9311-394db8c17cb8/index.html`,
    image: "/images/game_ico_aritmath.png",
    icon: <Calculator size={24} />,
    label: "Hitung Cepat",
    mode: "external",
  },
  {
    key: "/games/potion",
    link: `https://a1561333-1cb3-4d20-8013-4b82e3424f9f.poki-gdn.com/6fcd6282-bc97-4390-846e-684099d8cefc/index.html`,
    image: "/images/game_ico_potion.png",
    icon: <Calculator size={24} />,
    label: "Campur Ramuan",
    mode: "external",
  },
  {
    key: "/games/house_renovation",
    link: `https://70f6a8bd-45e6-416e-92df-e5e613f93177.poki-gdn.com/fb4a7fdf-0199-4b60-8801-22587ff1507b/index.html`,
    image: "/images/game_ico_house_renov.png",
    icon: <HouseIcon size={24} />,
    label: "Hias Rumah",
    mode: "external",
  },
  {
    key: "/games/cat_pizza",
    link: `https://f221e1d1-dcbd-496f-b713-93fb45e4ce63.poki-gdn.com/b8b86622-c2e5-4361-97a5-664ffb9c309d/index.html`,
    image: "/images/game_ico_cat_pizza.png",
    icon: <CatIcon size={24} />,
    label: "Kucing Pizza",
    mode: "external",
  },
  {
    key: "/games/bolt",
    link: `https://a04d8c0d-0a34-4649-b0ce-3ea5bd1618d9.poki-gdn.com/53f01d07-58ac-416b-9d10-4581adedd415/index.html`,
    image: "/images/game_ico_bolt.png",
    icon: <BoltIcon size={24} />,
    label: "Lepas Baut",
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
                className='rounded-lg shadow-sm object-contain w-full h-full'
              />
              <h1 className='text-xl flex gap-1 items-center justify-center'>{game.icon} {game.label}</h1>
            </div>
          </a>
          : <Link key={game.key} href={game.link} className='hover:scale-105 duration-300'>
            <div className='flex flex-col gap-2 border shadow-sm p-2 rounded-lg'>
              <img
                src={game.image}
                className='rounded-lg shadow-sm object-contain w-full h-full'
              />
              <h1 className='text-xl flex gap-1 items-center justify-center'>{game.icon} {game.label}</h1>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
