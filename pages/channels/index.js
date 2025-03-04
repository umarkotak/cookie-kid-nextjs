

import ytkiddAPI from '@/apis/ytkidApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Utils from '@/models/Utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Channels() {
  const [channelList, setChannelList] = useState([])
  const [blacklistChannelMap, setBlacklistChannelMap] = useState({})

  useEffect(() => {
    GetChannelList({})
    initializeBlacklistChannelMap()
  }, [])

  async function GetChannelList(params) {
    try {
      const response = await ytkiddAPI.GetChannels("", {}, params)
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      setChannelList(body.data)
    } catch (e) {
      console.error(e)
    }
  }

  function initializeBlacklistChannelMap() {
    if (!localStorage.getItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`)) {
      localStorage.setItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`, '{}')
    }
    var tmpBlacklistChannelMap = JSON.parse(localStorage.getItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`))
    setBlacklistChannelMap(tmpBlacklistChannelMap)
  }

  function handleCheckChange(e, channelID) {
    if (!localStorage.getItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`)) {
      localStorage.setItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`, '{}')
    }

    var tmpBlacklistChannelMap = JSON.parse(localStorage.getItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`))

    if (tmpBlacklistChannelMap[channelID]) {
      tmpBlacklistChannelMap[channelID] = false
    } else {
      tmpBlacklistChannelMap[channelID] = true
    }

    localStorage.setItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`, JSON.stringify(tmpBlacklistChannelMap))
    setBlacklistChannelMap(tmpBlacklistChannelMap)
  }

  function checkAll() {
    localStorage.setItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`, '{}')
    setBlacklistChannelMap({})
  }

  function unCheckAll() {
    var tmpBlacklistChannelMap = {}
    channelList.forEach((oneChannel) => {
      tmpBlacklistChannelMap[oneChannel.id] = true
    })
    localStorage.setItem(`COOKIEKID:BLACKLIST_CHANNEL_MAP`, JSON.stringify(tmpBlacklistChannelMap))
    setBlacklistChannelMap(tmpBlacklistChannelMap)
  }

  return (
    <main>
      <div className="mb-6 flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl">Channel List</h1>
          <small>you can enable or disable channel into your needs</small>
        </div>
        <div className='flex gap-2'>
          <Button onClick={()=>checkAll()}>Check All</Button>
          <Button onClick={()=>unCheckAll()}>Uncheck All</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-x-5 gap-y-8">
        {channelList.map((oneChannel) => (
          <Card key={oneChannel.id} className="hover:bg-accent">
            <CardHeader className="p-4">
              <div className='flex items-center gap-3'>
                <Link href={`/channels/${oneChannel.id}`}>
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={oneChannel.image_url}/>
                    <AvatarFallback><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
                  </Avatar>
                </Link>
                <Link href={`/channels/${oneChannel.id}`}>
                  <span>{oneChannel.name}</span>
                  <small className="">{oneChannel.string_tags}</small>
                </Link>
              </div>
              <div className="flex justify-end">
                <Switch
                  type="checkbox"
                  defaultChecked={!blacklistChannelMap[oneChannel.id]}
                  checked={!blacklistChannelMap[oneChannel.id]}
                  onClick={(e) => handleCheckChange(e, oneChannel.id)}
                />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  )
}
