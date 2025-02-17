

import { useRef, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import YouTube, { YouTubeProps } from 'react-youtube'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {Img} from 'react-image'
import ReactPlayer from 'react-player'
const ReactPlayerCsr = dynamic(() => import('@/components/ReactPlayerCsr'), { ssr: false })
import { useRouter } from 'next/router'

import YtVideo from '@/models/YtVideo'
import Utils from '@/models/Utils'
import VideoQuiz from '@/components/VideoQuiz'
import ytkiddAPI from '@/apis/ytkidApi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

var minutes = 3.5
var mobileModeLimit = 470
var smallWebLimit = 1015

export default function Watch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [videoPlayerHeight, setVideoPlayerHeight] = useState(0)
  const [mobileMode, setMobileMode] = useState(true)
  const [smallWebMode, setSmallWebMode] = useState(true)
  const [videoDetail, setVideoDetail] = useState({channel: {}})
  const [suggestionVideos, setSuggestionVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(new YtVideo({}))
  const [selectedVideoStat, setSelectedVideoStat] = useState({})
  const [allVideo, setAllVideo] = useState([])
  const [blockVideoRecomm, setBlockVideoRecomm] = useState(false)
  const [quizTs, setQuizTs] = useState(0)

  const videoPlayerDivRef = useRef()

  var rPlayerRef = useRef(null)
  const [playerPlaying, setPlayerPlaying] = useState(false)

  const intervalRef = useRef(null)

  useEffect(() => {
    if (typeof(window) === "undefined") { return }

    if (window.innerWidth <= mobileModeLimit) {
      setMobileMode(true)
      setSmallWebMode(true)
    } else if (window.innerWidth <= smallWebLimit) {
      setMobileMode(false)
      setSmallWebMode(true)
    } else {
      setMobileMode(false)
      setSmallWebMode(false)
    }

    const onResize = () => {
      if (window.innerWidth <= mobileModeLimit) {
        setMobileMode(true)
        setSmallWebMode(true)
      } else if (window.innerWidth <= smallWebLimit) {
        setMobileMode(false)
        setSmallWebMode(true)
      } else {
        setMobileMode(false)
        setSmallWebMode(false)
      }
    }

    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])


  useEffect(() => {
    if (!videoPlayerDivRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      if (!videoPlayerDivRef.current) return
      var res = Math.floor(videoPlayerDivRef.current.offsetWidth / (16 / 9))
      setVideoPlayerHeight(res)
    })
    resizeObserver.observe(videoPlayerDivRef.current)
    return () => resizeObserver.disconnect() // clean up
  }, [])

  useEffect(() => {
    if (!router.query.video_id) { return }

    GetVideoDetail(router.query.video_id)

    GetChannelVideos()

    if (localStorage && localStorage.getItem("COOKIEKID:QUIZ:ENABLE") !== "off") {
      setQuizTs(Date.now())
    }
  }, [router])

  async function GetVideoDetail(videoID) {
    try {
      const response = await ytkiddAPI.GetVideoDetail("", {}, {
        youtube_video_id: videoID,
      })
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      setVideoDetail(body.data)
    } catch (e) {
      console.error(e)
    }
  }

  async function GetChannelVideos() {
    try {
      const response = await ytkiddAPI.GetVideos("", {}, {
        limit: 50
      })
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      setSuggestionVideos(body.data.videos)
    } catch (e) {
      console.error(e)
    }
  }

  function videoContainerClass(tmpMobileMode, tmpSmallWebMode) {
    if (tmpMobileMode) { return "w-full" }
    if (tmpSmallWebMode) { return "w-full" }
    return "w-full"
  }

  useEffect(() => {
    const execCallback = () => {
      if (localStorage.getItem("COOKIEKID:QUIZ:ENABLE") === "off") {
        return
      }

      if (document) {
        try {
          if (document.fullscreenElement === null) {
          } else {
            document.exitFullscreen()
          }
        } catch(e) {}
      }

      setQuizTs(Date.now())
    }

    intervalRef.current = setInterval(execCallback, minutes * 60 * 1000)

    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <main className='flex flex-col lg:flex-row'>
      {/* <VideoQuiz ts={quizTs} setTs={setQuizTs} setPlayerPlaying={setPlayerPlaying} /> */}

      <div className='w-full mr-4 mb-4'>
        <div ref={videoPlayerDivRef} id="video-content">
          <div className={`relative overflow-hidden shadow-md`}>
            <div style={{height: `${videoPlayerHeight}px`}}>
              <ReactPlayerCsr
                ref={rPlayerRef}
                url={`https://www.youtube.com/watch?v=${videoDetail.external_id}`}
                width="100%"
                height="100%"
                playing={playerPlaying}
                controls={true}
              />
            </div>
            <div
              className='absolute right-[55px] bottom-0 w-28 rounded h-8 bg-red-100 bg-opacity-0'
            ></div>
            <div
              className={`${blockVideoRecomm ? "absolute left-0 bottom-14 w-full bg-black bg-opacity-90 h-full" : ""}`}
            ></div>
          </div>
        </div>
        <div className='p-1 mt-1'>
          <span className="font-semibold text-lg md:text-2xl leading-relaxed">{videoDetail.title}</span>
        </div>
        <div className={`flex justify-between items-center p-1 mt-1`}>
          <div className='flex items-center mr-2'>
            <Link href={`/channels/${videoDetail.channel.id}`} className='flex-none flex items-center gap-4 hover:bg-accent'>
              <Avatar>
                <AvatarImage src={videoDetail.channel.image_url} />
                <AvatarFallback><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
              </Avatar>
              <span className='text-sm font-semibold'>{videoDetail.channel.name}</span>
            </Link>
          </div>
        </div>
      </div>

      <div id="suggestion-content" className={`flex-none w-full sm:w-[402px] flex flex-col gap-5`}>
        {suggestionVideos.map((oneVideo)=>(
          <div className='flex flex-row gap-2 hover:bg-accent' key={oneVideo.id}>
            <div className='flex-none w-[168px] h-[94px]'>
              <Link href={`/watch/${oneVideo.id}`}>
                <img
                  className={`${mobileMode ? "" : ""} shadow-md w-full h-full`}
                  src={oneVideo.image_url}
                  alt="thumb"
                />
              </Link>
            </div>
            <div className='w-full flex flex-col gap-2'>
              <Link
                href={`/watch/${oneVideo.id}`}
                className="font-medium text-[14px] leading-5 line-clamp-2 tracking-tight"
              >{oneVideo.title}</Link>
              <Link href={`/channels/${oneVideo.channel.id}`} className="flex flex-row gap-2 text-sm items-center">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={oneVideo.channel.image_url} />
                  <AvatarFallback><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
                </Avatar>
                <span className='flex-auto text-[12px] line-clamp-2'>{oneVideo.channel.name}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
