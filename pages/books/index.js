import ytkiddAPI from "@/apis/ytkidApi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Books() {
  const [bookList, setBookList] = useState([]);
  const searchParams = useSearchParams();
  const [enableDev, setEnableDev] = useState(false);
  const [bookParams, setBookParams] = useState({});

  useEffect(() => {
    GetBookList(bookParams);

    if (searchParams && searchParams.get("dev") === "true") {
      setEnableDev(true);
    } else {
      setEnableDev(false);
    }
  }, [searchParams]);

  async function GetBookList(params) {
    try {
      params.types = "default";
      const response = await ytkiddAPI.GetBooks("", {}, params);
      const body = await response.json();
      if (response.status !== 200) {
        return;
      }

      setBookList(body.data.books);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <main className="pb-24 p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {bookList.map((oneBook) => (
          <Link
            href={`/books/${oneBook.id}/read?page=1`}
            key={oneBook.id}
            className="group"
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg hover:shadow-accent transition-shadow duration-300 flex flex-col h-full">
              <div className="relative overflow-hidden rounded-t-2xl">
                <img
                  className="w-full h-64 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  src={oneBook.cover_file_url}
                  alt={`Cover of ${oneBook.title}`}
                  loading="lazy"
                />
              </div>
              <div className="p-2 text-center flex-1 flex flex-col justify-between">
                <p className="text-base font-medium text-gray-800 truncate">
                  {oneBook.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
