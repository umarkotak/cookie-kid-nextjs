import ytkiddAPI from "@/apis/ytkidApi"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function Admin() {
  const [bookList, setBookList] = useState([])
  const searchParams = useSearchParams()
  const [enableDev, setEnableDev] = useState(false)
  const [bookParams, setBookParams] = useState({})

  useEffect(() => {
    GetBookList(bookParams)

    if (searchParams && searchParams.get("dev")==="true") {
      setEnableDev(true)
    } else {
      setEnableDev(false)
    }
  }, [searchParams])

  async function GetBookList(params) {
    try {
      params.types = "default"
      const response = await ytkiddAPI.GetBooks("", {}, params)
      const body = await response.json()
      if (response.status !== 200) {
        return
      }

      setBookList(body.data.books)
    } catch (e) {
      console.error(e)
    }
  }

  return(
    <div className="flex flex-col gap-1">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
