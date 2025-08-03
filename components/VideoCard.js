

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export default function VideoCard({
  ytkiddId,
  videoImageUrl,
  channelId,
  creatorImageUrl,
  shortedVideoTitle,
  creatorName,
}) {
  return (
    <div className='group rounded-lg hover:text-accent'>
      <div className='overflow-hidden rounded-lg'>
        <Link href={`/watch/${ytkiddId}`}>
          <img className="w-full rounded-lg group-hover:scale-105 transition" src={videoImageUrl} alt="thumb" onLoad={(e) => {
            if (e.target.width/e.target.height < 1.4) {
              e.target.src = "/images/no_video.png"
            }
          }} />
        </Link>
      </div>
      <div className="flex mt-2 overflow-hidden">
        <div className="min-w-[50px] p-1">
          <Link href={`/channels/${channelId}`} className="">
            <Avatar>
              <AvatarImage src={creatorImageUrl} />
              <AvatarFallback><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <Link href={`/watch/${ytkiddId}`}>
          <div className="flex flex-col w-full ml-1 pr-2">
            <span className="text-[15px] font-semibold break-words line-clamp-2">
              {shortedVideoTitle}
            </span>
            <span className="text-[12px] break-words mt-1">{creatorName}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
