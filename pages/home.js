import { useState, useEffect } from 'react'

import ChannelList from '@/components/ChannelList'
import VideoCard from '@/components/VideoCard'

import ytkiddAPI from '@/apis/ytkidApi'
import Utils from '@/models/Utils'
import { useSearchParams } from 'next/navigation'
import { HomeIcon, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdsenseAd from '@/components/AdsenseAd'

var videoIDs = []
var page = 1
var onApiCall = false
var tmpVideoList = []

export default function Home() {
  const [videoList, setVideoList] = useState([])
  const [channelList, setChannelList] = useState([])
  const searchParams = useSearchParams()

  useEffect(() => {
    videoIDs = []
    page = 1

    GetVideoList({
      page: page,
      exclude_ids: videoIDs.join(",")
    })
    GetChannelList({})
  }, [searchParams])

  async function GetVideoList(params) {
    try {
      if (onApiCall) {
        return
      }

      onApiCall = true
      const response = await ytkiddAPI.GetVideos("", {}, params)
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      tmpVideoList = [...tmpVideoList, ...body.data.videos]
      setVideoList(tmpVideoList)

      page += 1
      videoIDs = videoIDs.concat(body.data.videos.map((oneVideo) => (oneVideo.id)))
      onApiCall = false
    } catch (e) {
      console.error(e)
      onApiCall = false
    }
  }

  async function GetChannelList(params) {
    try {
      const response = await ytkiddAPI.GetChannels("", {}, params)
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      setChannelList(Utils.ShuffleArray(body.data))
    } catch (e) {
      console.error(e)
    }
  }

  const handleScroll = () => {
    var position = window.pageYOffset
    var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight

    console.log(maxPosition - position)
    if (maxPosition - position <= 1200) {

      GetVideoList({
        page: page,
        exclude_ids: videoIDs.join(",")
      })
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className='w-full pb-4'>
        <div className="flex gap-2 flex-row overflow-auto">
          {channelList.map((oneChannel) => (
            <ChannelList
              key={oneChannel.id}
              channelId={oneChannel.id}
              channelImageUrl={oneChannel.image_url}
              channelName={oneChannel.name}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
        {/* <AdsenseAd /> */}
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
