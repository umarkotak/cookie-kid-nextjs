import ytkiddAPI from "@/apis/ytkidApi"
import ImageDrawer from "@/components/ImageDrawer"
import { ArrowLeft, ArrowRight, Eraser, FileIcon, FullscreenIcon, MenuIcon, PencilIcon, Printer } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/router"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
// import CanvasDraw from "react-canvas-draw";

var tmpBookDetail = {}
var tmpMaxPageNumber = 0
export default function Read() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const drawingCanvas = useRef(null)
  const [bookDetail, setBookDetail] = useState({})
  const [activePage, setActivePage] = useState({})
  const [activePageNumber, setActivePageNumber] = useState(1)
  const [imageLoading, setImageLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  // state for drawing
  const [tool, setTool] = useState('draw')
  const [color, setColor] = useState('#ff0000')
  const [brushSize, setBrushSize] = useState(3)
  const [imageLoaded, setImageLoaded] = useState(new Date)
  const [showTool, setShowTool] = useState(true)

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
      }

    } catch (e) {
      console.error(e)
    }
  }

  function NextPage() {
    if (activePageNumber >= tmpMaxPageNumber) { return }
    setImageLoading(true)
    router.push({
      pathname: `/workbooks/${router.query.book_id}/read`,
      search: `?page=${activePageNumber+1}`
    })
  }

  function PrevPage() {
    if (activePageNumber <= 1) { return }
    setImageLoading(true)
    router.push({
      pathname: `/workbooks/${router.query.book_id}/read`,
      search: `?page=${activePageNumber-1}`
    })
  }

  function ToggleFullScreen() {
    setIsFullscreen(!isFullscreen)
  }

  function ImageLoaded() {
    // setImageLoading(false)
    // setImageLoaded(new Date)
  }

  return(
    <main className="">
      <div
        className={`bg-background ${isFullscreen ? `
          fixed top-0 left-0 w-full h-screen z-50
        ` : `
          h-[calc(100vh-70px)] max-h-[calc(100vh-70px)] overflow-hidden
        `}`}
      >
        <div className="relative h-full">
          {bookDetail.contents && bookDetail.contents.map((page, index) => (
            <div
              key={"pagekey" + index + page.image_file_url}
              className={`relative w-full ${activePage.image_file_url === page.image_file_url ? "h-full" : "invisible h-0"}`}
            >
              <div
                className={`border border-foreground shadow-md ${isFullscreen ? `
                  object-contain absolute top-0 left-0 w-full h-screen
                ` : `
                  mx-auto h-full
                `}`}
              >
                <ImageDrawer imageUrl={page.image_file_url} />
              </div>
            </div>
          ))}

          {/* PAGE NAVIGATION */}
          <div className="absolute z-10 bottom-2 right-2 flex gap-1 bg-white bg-opacity-80 rounded-full border border-black shadow-sm px-1 py-0.5">
            <button
              className="rounded-lg flex justify-start items-center hover:scale-110 duration-500 p-1"
              onClick={()=>PrevPage()}
            >
              <span className="text-black"><ArrowLeft size={18} /></span>
            </button>
            <button
              className="rounded-lg flex justify-start items-center p-1"
            >
              <span className="text-black text-[14px]">{activePageNumber} / {tmpMaxPageNumber}</span>
            </button>
            <button
              className="rounded-lg flex justify-start items-center hover:scale-110 duration-500 p-1"
              onClick={()=>NextPage()}
            >
              <span className="text-black"><ArrowRight size={18} /></span>
            </button>
            <button
              className="rounded-lg flex justify-start items-center hover:scale-110 duration-500 p-1"
              onClick={()=>ToggleFullScreen()}
            >
              <span className="text-black"><FullscreenIcon size={18} /></span>
            </button>
            {bookDetail.pdf_url && bookDetail.pdf_url !== "" && <a href={bookDetail.pdf_url} target="_blank"><button
              className="rounded-lg flex justify-start items-center hover:scale-110 duration-500 p-1"
            >
              <span className="text-black"><Printer size={18} /></span>
            </button></a>}
          </div>
        </div>
      </div>
    </main>
  )
}
