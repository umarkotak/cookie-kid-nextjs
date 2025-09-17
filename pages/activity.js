'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PlayCircle, BookOpen, RefreshCw, Clock } from 'lucide-react'
import ytkiddAPI from '@/apis/ytkidApi'
import { toast } from 'react-toastify'
import { useTheme } from 'next-themes'

/**
 * Modernized Activities Page
 * - Polished visuals: rounded-2xl cards, subtle borders & shadows, hover lift
 * - Unified ActivityCard for video/book with icons & overlays
 * - Robust loading skeletons & empty state
 * - Safer image fallbacks & defensive metadata handling
 * - Accessible labels & keyboard-friendly buttons/links
 */

const FALLBACK_THUMB = '/placeholder-video.jpg'

const percentFrom = (current = 0, max = 0) => {
  if (!max) return 100
  const pct = Math.min(Math.max((current / max) * 100, 0), 100)
  return Number.isFinite(pct) ? Math.round(pct) : 0
}

const progressLabel = (current = 0, max = 0) => {
  if (!max) return 'Completed'
  return `${current}/${max}`
}

function MediaThumb({ src, title, icon, redir }) {
  return (
    <Link href={redir || "#"}>
      <div className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src || FALLBACK_THUMB}
          alt={title || 'media thumbnail'}
          className="group-hover:scale-105 transition-transform w-full h-full object-contain bg-muted"
          onError={(e) => {
            // @ts-ignore – HTMLImageElement target
            e.currentTarget.src = FALLBACK_THUMB
          }}
          />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-black/0 to-black/0" />
        {/* <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div> */}
      </div>
    </Link>
  )
}

function VideoCard({ activity }) {
  const router = useRouter()
  const data = activity?.video || {}
  const current = activity?.metadata?.current_progress ?? 0
  const max = activity?.metadata?.max_progress ?? 0
  const pct = percentFrom(current, max)
  const title = data?.title || 'Untitled'
  const redirect = data?.redirect_path

  const onOpen = useCallback(() => {
    if (!redirect) return
    try {
      router.push(redirect)
    } catch {
      window.location.href = redirect
    }
  }, [redirect, router])

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-muted/40 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <MediaThumb
            src={data?.image_url}
            title={title}
            icon={<PlayCircle className="w-7 h-7 text-white drop-shadow-md" />}
            redir={redirect}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2">{title}</h3>
              <Badge variant="default" className="text-[10px] sm:text-xs rounded-full">Video</Badge>
            </div>

            {(data?.channel_name || data?.channel_image_url) ? (
              <div className="flex items-center gap-2 mb-3 min-h-5">
                {data?.channel_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.channel_image_url}
                    alt={data?.channel_name || 'Channel'}
                    className="w-4 h-4 rounded-full"
                    onError={(e) => {
                      // @ts-ignore
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
                {data?.channel_name ? (
                  <span className="text-xs text-muted-foreground truncate">{data.channel_name}</span>
                ) : null}
              </div>
            ) : (
              <div className="mb-3 min-h-5"><span className="sr-only">No secondary info</span></div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Progress</span>
                {/* <span aria-label="progress label">{progressLabel(current, max)} • {pct}%</span> */}
                <span aria-label="progress label">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>

            <div className="mt-3 sm:mt-4">
              {redirect ? (
                <Button variant="secondary" size="sm" className="w-full h-9 text-xs sm:text-sm" onClick={onOpen}>
                  {pct === 100 ? 'Tonton Ulang' : 'Lanjutkan Menonton'}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="w-full h-9 text-xs sm:text-sm" disabled>
                  No link available
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BookCard({ activity }) {
  const router = useRouter()
  const data = activity?.book || {}
  const current = activity?.metadata?.current_progress ?? 0
  const max = activity?.metadata?.max_progress ?? 0
  const pct = percentFrom(current, max)
  const title = data?.title || `Book ${activity?.book_id ?? ''}`
  const redirect = data?.redirect_path || "#"

  const onOpen = useCallback(() => {
    if (!redirect) return
    try {
      router.push(redirect)
    } catch {
      window.location.href = redirect
    }
  }, [redirect, router])

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-muted/40 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <MediaThumb
            src={data?.image_url}
            title={title}
            icon={<BookOpen className="w-7 h-7 text-white drop-shadow-md" />}
            redir={redirect}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2">{title}</h3>
              <Badge variant="secondary" className="text-[10px] sm:text-xs rounded-full">Book</Badge>
            </div>

            <div className="mb-3 min-h-5">
              {/* {activity?.book_id ? (
                <span className="text-xs text-muted-foreground">Book ID: {activity.book_id}</span>
              ) : (
                <span className="sr-only">No secondary info</span>
              )} */}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Progress</span>
                {/* <span aria-label="progress label">{progressLabel(current, max)} • {pct}%</span> */}
                <span aria-label="progress label">{progressLabel(current, max)}</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>

            <div className="mt-3 sm:mt-4">
              {redirect ? (
                <Link href={redirect}>
                  <Button variant="secondary" size="sm" className="w-full h-9 text-xs sm:text-sm">
                    {pct === 100 ? 'Baca Ulang' : 'Lanjutkan Membaca'}
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm" className="w-full h-9 text-xs sm:text-sm" disabled>
                  No link available
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivitySkeleton() {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <Skeleton className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UserActivitiesPage() {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(true);

  // apply theme to <html>
  useEffect(() => {
    setIsDark(resolvedTheme === 'dark');
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else if (resolvedTheme === 'light') {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [resolvedTheme])

  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchActivities = useCallback(async () => {
    try {
      setLoading((prev) => prev && true)
      setRefreshing((prev) => !prev && !loading ? true : prev)
      const response = await ytkiddAPI.GetUserActivity('', {}, {})

      if (!response?.ok) throw new Error('Failed to fetch activities')

      const payload = await response.json()
      const list = payload?.data?.activities || []
      setActivities(Array.isArray(list) ? list : [])
    } catch (err) {
      toast.error(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [loading])

  useEffect(() => {
    fetchActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasItems = activities?.length > 0

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            📝 Aktivitas Ku
          </h1>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivities}
            className="inline-flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <ActivitySkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : hasItems ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity, idx) => {
              const key =
                activity?.id ||
                `${activity?.activity_type || 'item'}-${activity?.youtube_video_id || 'y'}-${activity?.book_id || 'b'}-${idx}`
              return (activity?.activity_type === 'video' ? (
                <VideoCard key={key} activity={activity} />
              ) : (
                <BookCard key={key} activity={activity} />
              ))
            })}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="relative mx-auto mb-6 w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-muted" />
        <Clock className="absolute inset-0 m-auto w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No activities yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Start watching videos or reading books to see your progress here.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild variant="secondary">
          <Link href="/explore">Explore Content</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/library">Open Library</Link>
        </Button>
      </div>
    </div>
  )
}
