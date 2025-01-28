

import Link from 'next/link'
import { Button } from './ui/button'
import { AvatarImage } from '@radix-ui/react-avatar'
import { Avatar, AvatarFallback } from './ui/avatar'

export default function ChannelList({ channelId, channelImageUrl, channelName }) {
  return (
    <>
      <Link
        href={`/channels/${channelId}`}
        key={channelId}
      >
        <Button variant="outline" size="">
          <Avatar className="h-6 w-6">
            <AvatarImage src={channelImageUrl} />
            <AvatarFallback><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
          </Avatar>
          {channelName}
        </Button>
      </Link>
    </>
  )
}
