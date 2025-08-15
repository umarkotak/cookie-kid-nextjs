import ytkiddAPI from "@/apis/ytkidApi"
import { LoadingSpinner } from "@/components/ui/spinner"
import { ArrowLeft, ArrowRight, FullscreenIcon, PrinterIcon, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

var tmpBookDetail = {}
var tmpMaxPageNumber = 0

export default function Read() {
  const router = useRouter()

  const [bookDetail, setBookDetail] = useState({})
  const searchParams = useSearchParams()
  const [activePage, setActivePage] = useState({})
  const [activePageNumber, setActivePageNumber] = useState(1)
  const [imageLoading, setImageLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    tmpBookDetail = {}
    tmpMaxPageNumber = 0
  }, [])

  useEffect(() => {
    setImageLoading(true)
    GetBookDetail(router.query.book_id)
  }, [router])

  useEffect(() => {
    if (!tmpBookDetail.id) { return }
    if (!tmpBookDetail.contents) { return }

    var pageNumber = parseInt(searchParams.get("page"))
    var pageIndex = pageNumber - 1
    if (pageIndex <= 0) { pageIndex = 0 }
    if (pageIndex >= tmpMaxPageNumber) { pageIndex = tmpMaxPageNumber - 1 }

    setActivePageNumber(pageIndex+1)

    if (!tmpBookDetail.contents[pageIndex] || !tmpBookDetail.contents[pageIndex].image_file_url) { return }
    setActivePage(tmpBookDetail.contents[pageIndex])
  }, [router, bookDetail])

  async function GetBookDetail(bookID) {
    if (!bookID) { return }

    if (bookDetail.id === parseInt(bookID)) { return }

    try {
      const response = await ytkiddAPI.GetBookDetail("", {}, {
        book_id: bookID
      })
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      tmpBookDetail = body.data
      tmpMaxPageNumber = tmpBookDetail.contents.length
      setBookDetail(tmpBookDetail)

      const preloadImage = async (imageUrl) => {
        const image = new Image();
        image.src = imageUrl;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
      };

      for(const oneContent of tmpBookDetail.contents) {
        await preloadImage(oneContent.image_file_url);
        console.log("PRELOADED", oneContent.image_file_url)
      }

    } catch (e) {
      console.error(e)
    }
  }

  function NextPage() {
    if (activePageNumber >= tmpMaxPageNumber) { return }
    setImageLoading(true)
    router.push({
      pathname: `/books/${router.query.book_id}/read`,
      search: `?page=${activePageNumber+1}`
    })
  }

  function PrevPage() {
    if (activePageNumber <= 1) { return }
    setImageLoading(true)
    router.push({
      pathname: `/books/${router.query.book_id}/read`,
      search: `?page=${activePageNumber-1}`
    })
  }

  function ToggleFullScreen() {
    setIsFullscreen(!isFullscreen)
  }

  function ToggleDrawer() {
    setIsDrawerOpen(!isDrawerOpen)
  }

  function GoToPage(pageNumber) {
    setImageLoading(true)
    setIsDrawerOpen(false)
    router.push({
      pathname: `/books/${router.query.book_id}/read`,
      search: `?page=${pageNumber}`
    })
  }

  function ImageLoaded() {
    setImageLoading(false)
  }

  return(
    <main className="p-2 w-full">
      <div
        className={`${isFullscreen ? `
          absolute top-0 left-0 w-full h-screen z-50 bg-background
        ` : `
          max-h-[calc(100vh-100px)] relative
        `}`}
      >
        <img
          className={`${isFullscreen ? `
            object-contain absolute top-0 left-0 w-full h-screen
          ` : `
            max-h-[calc(100vh-100px)] object-contain mx-auto rounded-lg
          `}`}
          src={activePage.image_file_url}
          onLoad={()=>ImageLoaded()}
        />

        {/* Loading overlay */}
        <div className={`absolute z-20 top-0 left-0 w-full h-full bg-black bg-opacity-10 backdrop-blur-sm ${imageLoading ? "block" : "hidden"}`}>
          <div className="mx-auto text-center text-xl flex flex-col h-full justify-center">
            <div>
              <span className="bg-background py-1 px-2 rounded-lg flex items-center"><LoadingSpinner size={20}/> Loading...</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute z-10 top-2 right-2 flex justify-start items-center gap-2">
          {bookDetail.pdf_url && bookDetail.pdf_url !== "" &&
            <a href={bookDetail.pdf_url} target="_blank">
              <button className="rounded-lg hover:scale-110 bg-white text-black bg-opacity-50 duration-500 p-1.5 text-sm">
                <span className="text-black"><PrinterIcon size={22} /></span>
              </button>
            </a>
          }
          <button
            className="rounded-lg hover:scale-110 bg-white text-black bg-opacity-50 duration-500 p-1.5 text-sm"
            onClick={ToggleDrawer}
          >
            Select Page
          </button>
          <button className="rounded-lg hover:scale-110 bg-white text-black bg-opacity-50 duration-500 p-1.5 text-sm">
            <span className="">{activePageNumber} / {tmpMaxPageNumber}</span>
          </button>
          <button
            className="rounded-lg hover:scale-110 bg-white text-black bg-opacity-50 duration-500 p-1.5 text-sm"
            onClick={ToggleFullScreen}
          >
            <span className=""><FullscreenIcon size={20} /></span>
          </button>
        </div>

        {/* Navigation arrows */}
        <button
          className="absolute z-0 top-0 left-0 w-1/2 h-full bg-transparent hover:cursor-w-resize hover:bg-black hover:bg-opacity-5 rounded-l-lg flex justify-start items-center"
          onClick={PrevPage}
        >
          <span className="bg-white opacity-50 text-black"><ArrowLeft /></span>
        </button>
        <button
          className="absolute z-0 top-0 right-0 w-1/2 h-full bg-transparent hover:cursor-e-resize hover:bg-black hover:bg-opacity-5 rounded-r-lg flex justify-end items-center"
          onClick={NextPage}
        >
          <span className="bg-white opacity-50 text-black"><ArrowRight /></span>
        </button>
      </div>

      {/* Drawer overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={ToggleDrawer}
        />
      )}

      {/* Page selection drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Select Page</h3>
            <button
              onClick={ToggleDrawer}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 h-full overflow-y-auto pb-20">
          <div className="grid grid-cols-2 gap-3">
            {tmpBookDetail.contents && tmpBookDetail.contents.map((page, index) => (
              <div
                key={index}
                className={`relative cursor-pointer group transition-all duration-200 ${
                  activePageNumber === index + 1
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'hover:scale-105 hover:shadow-lg'
                }`}
                onClick={() => GoToPage(index + 1)}
              >
                {/* Page preview */}
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={page.image_file_url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Page number */}
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>

                {/* Active page indicator */}
                {activePageNumber === index + 1 && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Current
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}