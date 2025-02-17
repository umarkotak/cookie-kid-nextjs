import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, BotMessageSquare, ImageIcon, MessageCircleQuestion, PlusIcon,  } from 'lucide-react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

import ytkiddAPI from '@/apis/ytkidApi'
import Utils from '@/models/Utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  const searchParams = useSearchParams()
  const [imageUrls, setImageUrls] = useState([])

  useEffect(() => {
    GetImageList()
  }, [])

  async function GetImageList(params) {
    try {
      const response = await ytkiddAPI.GetComfyUIOutput("", {}, params)
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      setImageUrls(body.data.image_urls)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <div>Comfy UI Gallery</div>
              <Link href="/admin/comfy_ui/generate"><Button size="sm"><PlusIcon />Generate Image</Button></Link>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="mt-4 w-full mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {imageUrls.map((imageUrl) => (
          <div className='flex flex-col gap-2 border shadow-sm rounded-md' key={imageUrl}>
            <Zoom>
              <img
                className='w-full rounded-lg shadow-sm'
                src={`https://${imageUrl}`}
              />
            </Zoom>
          </div>
        ))}
      </div>
    </div>
  )
}
