"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import ytkiddAPI from '@/apis/ytkidApi'
import VideoCard from '@/components/VideoCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Channel() {
  const router = useRouter()

  const [channelDetail, setChannelDetail] = useState({})
  const [videoList, setVideoList] = useState([])

  useEffect(() => {
    if (!router.query.channel_id) { return }

    GetChannelDetail(router.query.channel_id)
  }, [router])

  async function GetChannelDetail(channelID) {
    try {
      const response = await ytkiddAPI.GetChannelDetail("", {}, {
        channel_id: channelID,
      })
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      setChannelDetail(body.data.channel)
      setVideoList(body.data.videos)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={channelDetail.image_url} />
              <AvatarFallback><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
            </Avatar>
            <span className='text-xl'>{channelDetail.name}</span>
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-8">
        {videoList.map((oneVideo) => (
          <VideoCard
            key={oneVideo.id}
            ytkiddId={oneVideo.id}
            videoId={oneVideo.id}
            videoImageUrl={oneVideo.image_url}
            channelId={oneVideo.channel.id}
            creatorImageUrl={oneVideo.channel.image_url}
            shortedVideoTitle={oneVideo.title}
            creatorName={oneVideo.channel.name}
          />
        ))}
      </div>
    </div>
  )
}
