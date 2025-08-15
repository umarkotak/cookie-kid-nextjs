import ytkiddAPI from "@/apis/ytkidApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
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
  storage: "local", // local,r2
  store_pdf: false, // Changed to boolean for switch
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

  const handleRadioChange = (value, field) => {
    setBookParams({...bookParams, [field]: value})
  }

  const handleSwitchChange = (checked) => {
    setBookParams({...bookParams, store_pdf: checked})
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
    formData.append("storage", bookParams.storage)
    formData.append("store_pdf", bookParams.store_pdf.toString()) // Convert boolean to string

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
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {uploadMode === "pdf" ? (
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload PDF Book</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={(e)=>handleFileChange(e)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="pdf-url">PDF URL</Label>
                <Input
                  id="pdf-url"
                  type="text"
                  placeholder="Enter PDF file URL"
                  onChange={(e)=>handleParamsChange(e, "pdf_url")}
                  value={bookParams.pdf_url}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter book title"
                onChange={(e)=>handleParamsChange(e, "title")}
                value={bookParams.title}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  type="text"
                  placeholder="Enter slug"
                  onChange={(e)=>handleParamsChange(e, "slug")}
                  value={bookParams.slug}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-image-slug">Custom Image Slug</Label>
                <Input
                  id="custom-image-slug"
                  type="text"
                  placeholder="Enter custom image slug"
                  onChange={(e)=>handleParamsChange(e, "custom_image_slug")}
                  value={bookParams.custom_image_slug}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Book Type Radio Group */}
              <div className="space-y-3">
                <Label>Book Type</Label>
                <RadioGroup
                  value={bookParams.book_type}
                  onValueChange={(value) => handleRadioChange(value, "book_type")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="book-default" />
                    <Label htmlFor="book-default">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="workbook" id="book-workbook" />
                    <Label htmlFor="book-workbook">Workbook</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Image Format Radio Group */}
              <div className="space-y-3">
                <Label>Image Format</Label>
                <RadioGroup
                  value={bookParams.img_format}
                  onValueChange={(value) => handleRadioChange(value, "img_format")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jpeg" id="format-jpeg" />
                    <Label htmlFor="format-jpeg">JPEG</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="png" id="format-png" />
                    <Label htmlFor="format-png">PNG</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Storage Radio Group */}
              <div className="space-y-3">
                <Label>Storage</Label>
                <RadioGroup
                  value={bookParams.storage}
                  onValueChange={(value) => handleRadioChange(value, "storage")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="storage-local" />
                    <Label htmlFor="storage-local">Local</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="r2" id="storage-r2" />
                    <Label htmlFor="storage-r2">R2</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter book description"
                onChange={(e)=>handleParamsChange(e, "description")}
                value={bookParams.description}
              />
            </div>

            {/* Store PDF Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="store-pdf"
                checked={bookParams.store_pdf}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="store-pdf">Store PDF</Label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}