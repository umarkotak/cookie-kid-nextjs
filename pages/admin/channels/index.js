

import ytkiddAPI from '@/apis/ytkidApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Utils from '@/models/Utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlusIcon, RefreshCcw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'react-toastify'

export default function Channels() {
  const [channelList, setChannelList] = useState([])
  const [blacklistChannelMap, setBlacklistChannelMap] = useState({})

  useEffect(() => {
    GetChannelList({})
  }, [])

  async function GetChannelList(params) {
    try {
      const response = await ytkiddAPI.GetChannels("", {}, params)
      const body = await response.json()
      if (response.status !== 200) {
        toast.error(`Error getting youtube channels: ${body.data}`)
        return
      }

      setChannelList(body.data)
    } catch (e) {
      console.error(e)
    }
  }

  async function SyncChannel(oneChannel, breakOnExists) {
    try {
      console.log(oneChannel)
      var scrapParams = {
        "channel_id": oneChannel.external_id,
        "page_token": "",
        "query": "",
        "max_page": 20,
        "break_on_exists": breakOnExists
      }

      const response = await ytkiddAPI.PostScrapYoutubeVideos("", {}, scrapParams)

      const body = await response.json()

      if (response.status !== 200) {
        toast.error(`Error scrapping youtube videos: ${body.data}`)
        return
      }

      toast.success(`Success sycn ${oneChannel.name}`)

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Manage Channels</span>
            <Link href="/admin/channels/add">
              <Button size="sm" variant="default"><PlusIcon />Add Channel</Button>
            </Link>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-x-5 gap-y-8">
        {channelList.map((oneChannel) => (
          <Card key={oneChannel.id} className="hover:bg-accent">
            <Link href={`/admin/channels/${oneChannel.id}/edit`}>
              <CardHeader className="p-4">
                <div className='flex items-center gap-3'>
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={oneChannel.image_url}/>
                      <AvatarFallback><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
                    </Avatar>
                  <div>
                    <span>{oneChannel.name}</span>
                    <small className="">{oneChannel.string_tags}</small>
                  </div>
                </div>
              </CardHeader>
            </Link>
            <CardContent className="p-4">
              <div className='flex items-center justify-end'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">action</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => SyncChannel(oneChannel, false)}>
                      Sync All
                      <DropdownMenuShortcut><RefreshCcw size={16} /></DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => SyncChannel(oneChannel, true)}>
                      Sync With Break
                      <DropdownMenuShortcut><RefreshCcw size={16} /></DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
