import ytkiddAPI from "@/apis/ytkidApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Utils from "@/models/Utils"
import { classNames } from "@react-pdf-viewer/core"
import { BookIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const defaultBookParams = {
  pdf_url: "",
  title: "",
  slug: "",
  custom_image_slug: "",
  description: "",
  img_format: "jpeg", // jpeg,png
  book_type: "default", // default,workbook
}
export default function DevBooks() {
  const searchParams = useSearchParams()

  const [bookPdfFile, setBookPdfFile] = useState(null)
  const [uploadMode, setUploadMode] = useState("pdf")
  const [bookParams, setBookParams] = useState(defaultBookParams)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
  }, [])

  const handleFileChange = (event) => {
    setBookPdfFile(event.target.files[0])
  }

  const handleParamsChange = (event, field) => {
    if (field === "title") {
      setBookParams({...bookParams,
        "slug": Utils.Slugify(event.target.value),
        "custom_image_slug": Utils.Slugify(event.target.value),
        "title": event.target.value,
      })
      return
    }

    setBookParams({...bookParams, [field]: event.target.value})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("pdf_file", bookPdfFile)
    formData.append("pdf_url", bookParams.pdf_url)
    formData.append("title", bookParams.title)
    formData.append("slug", bookParams.slug)
    formData.append("custom_image_slug", bookParams.custom_image_slug)
    formData.append("description", bookParams.description)
    formData.append("img_format", bookParams.img_format)
    formData.append("book_type", bookParams.book_type)

    try {
      const response = await fetch(`${ytkiddAPI.Host}/ytkidd/api/books/insert_from_pdf`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setIsSubmitting(false)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error.internal_error)
        setIsSubmitting(false)
        return
      }
    } catch (error) {
      toast.error(error)
      setIsSubmitting(false)
      return
    }

    setBookPdfFile(null)
    setBookParams(defaultBookParams)
    toast("Add book success!", {
      onClose: ((reason) => {})
    })
  }

  return(
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <span className="flex gap-1 items-center"><BookIcon size={18} /> Add Book</span>
              <div className="flex gap-1">
                <Button
                  variant={uploadMode === "pdf" ? "default" : "outline"}
                  onClick={()=>setUploadMode("pdf")}
                >Upload By PDF</Button>
                <Button
                  variant={uploadMode === "url" ? "default" : "outline"}
                  onClick={()=>setUploadMode("url")}
                >Upload By URL</Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>


      <Card>
        <CardContent className="p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            { uploadMode === "pdf" ? <div>
              <label>Upload Pdf Book</label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e)=>handleFileChange(e)}
              />
            </div> : <div>
              <label>Url Pdf Book</label>
              <Input
                type="text" placeholder="pdf file url"
                onChange={(e)=>handleParamsChange(e, "pdf_url")}
                value={bookParams.pdf_url}
              />
            </div> }
            <div>
              <label>Title</label>
              <Input
                type="text" placeholder="" className="input input-bordered w-full"
                onChange={(e)=>handleParamsChange(e, "title")}
                value={bookParams.title}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-full">
                <label>Slug</label>
                <Input
                  type="text" placeholder="" className="input input-bordered w-full"
                  onChange={(e)=>handleParamsChange(e, "slug")}
                  value={bookParams.slug}
                />
              </div>
              <div className="w-full">
                <label>Custom Image Slug</label>
                <Input
                  type="text" placeholder="" className="input input-bordered w-full"
                  onChange={(e)=>handleParamsChange(e, "custom_image_slug")}
                  value={bookParams.custom_image_slug}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-full">
                <label>Book Type</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  onChange={(e)=>handleParamsChange(e, "book_type")}
                  value={bookParams.book_type}
                >
                  <option value="default">Default</option>
                  <option value="workbook">Workbook</option>
                </select>
              </div>
              <div className="w-full">
                <label>Image Format</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  onChange={(e)=>handleParamsChange(e, "img_format")}
                  value={bookParams.img_format}
                >
                  <option value="jpeg">Jpeg</option>
                  <option value="png">Png</option>
                </select>
              </div>
            </div>
            <div className="w-full">
              <label>Description</label>
              <Input
                type="text" placeholder=""
                onChange={(e)=>handleParamsChange(e, "description")}
                value={bookParams.description}
              />
            </div>
            <div className="w-full flex justify-end">
              <Button type="submit" variant="default" disabled={isSubmitting}>Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
