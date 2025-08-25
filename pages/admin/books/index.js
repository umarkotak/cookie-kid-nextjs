import ytkiddAPI from "@/apis/ytkidApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Eye, Filter, MoreHorizontal, Pencil, PlusIcon, Search, Trash, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Books() {
  const [bookList, setBookList] = useState([]);
  const searchParams = useSearchParams();
  const [enableDev, setEnableDev] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState(["default"]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState("title_asc");
  const [access, setAccess] = useState("all");
  const [loading, setLoading] = useState(false);
  const [accessTags, setAccessTags] = useState([])

  // Temporary filter states for modal (before applying)
  const [tempSelectedTypes, setTempSelectedTypes] = useState(["default"]);
  const [tempSelectedTags, setTempSelectedTags] = useState([]);
  const [tempTitle, setTempTitle] = useState("");
  const [tempSort, setTempSort] = useState("title_asc");
  const [tempAccess, setTempAccess] = useState("all");
  const [tempAccessTags, setTempAccessTags] = useState([])
  const [now, setNow] = useState(0)

  // Available options (you can make these dynamic by fetching from API)
  const typeOptions = [
    { value: "default", label: "Default" },
    { value: "workbook", label: "Workbook" },
  ];

  const sortOptions = [
    { value: "title_asc", label: "A-Z" },
    { value: "title_desc", label: "Z-A" },
    { value: "id_desc", label: "Newest" },
    { value: "id_asc", label: "Oldest" },
    { value: "random", label: "Random" },
  ];

  const accessOptions = [
    { value: "all", label: "All" },
    { value: "free", label: "Free" },
    { value: "premium", label: "Premium" },
  ];

  // Initialize filters from URL params
  useEffect(() => {
    const urlTypes = searchParams.get("types");
    const urlTags = searchParams.get("tags");
    const urlTitle = searchParams.get("title");
    const urlSort = searchParams.get("sort");
    const urlAccess = searchParams.get("access");
    const urlExcludeAccess = searchParams.get("exclude_access");

    if (urlTypes) {
      setSelectedTypes(urlTypes.split(","));
      setTempSelectedTypes(urlTypes.split(","));
    }
    if (urlTags) {
      setSelectedTags(urlTags.split(","));
      setTempSelectedTags(urlTags.split(","));
    }
    if (urlTitle) {
      setTitle(urlTitle);
      setTempTitle(urlTitle);
    }
    if (urlSort) {
      setSort(urlSort);
      setTempSort(urlSort);
    }
    
    // Determine access value from URL params
    if (urlAccess === "free") {
      setAccess("free");
      setTempAccess("free");
    } else if (urlExcludeAccess === "free") {
      setAccess("premium");
      setTempAccess("premium");
    } else {
      setAccess("all");
      setTempAccess("all");
    }

    if (searchParams && searchParams.get("dev") === "true") {
      setEnableDev(true);
    } else {
      setEnableDev(false);
    }
  }, [searchParams]);

  // Fetch books when filters change
  useEffect(() => {
    const params = {
      types: selectedTypes.join(","),
      tags: selectedTags.join(","),
      title: title,
      sort: sort
    };

    // Add access-related params based on access value
    if (access === "free") {
      params.access = "free";
    } else if (access === "premium") {
      params.exclude_access = "free";
    }
    // If access === "all", don't add any access params

    GetBookList(params);
  }, [selectedTypes, selectedTags, title, sort, access, now]);

  useEffect(() => {
    setSort(tempSort);
    setAccess(tempAccess);
  }, [tempSort, tempAccess]);

  async function GetBookList(params) {
    setLoading(true);
    try {
      // Clean up params - remove empty values
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await ytkiddAPI.GetBooks("", {}, cleanParams);
      const body = await response.json();
      if (response.status !== 200) {
        return;
      }

      setBookList(body.data.books);
      if (body.data.tag_group) {
        setTagOptions(body.data.tag_group)
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleTempTagChange = (tagValue, checked) => {
    if (checked) {
      setTempSelectedTags(prev => [...prev, tagValue]);
    } else {
      setTempSelectedTags(prev => prev.filter(t => t !== tagValue));
    }
  };

  const applyFilters = () => {
    setSelectedTypes(tempSelectedTypes);
    setSelectedTags(tempSelectedTags);
    setTitle(tempTitle);
    setSort(tempSort);
    setAccess(tempAccess);
    setIsFilterModalOpen(false);
    setNow(new Date())
  };

  const clearFilters = () => {
    const defaultValues = {
      types: ["default"],
      tags: [],
      title: "",
      sort: "title_asc",
      access: "all"
    };

    setSelectedTypes(defaultValues.types);
    setSelectedTags(defaultValues.tags);
    setTitle(defaultValues.title);
    setSort(defaultValues.sort);
    setAccess(defaultValues.access);

    setTempSelectedTypes(defaultValues.types);
    setTempSelectedTags(defaultValues.tags);
    setTempTitle(defaultValues.title);
    setTempSort(defaultValues.sort);
    setTempAccess(defaultValues.access);
  };

  const resetTempFilters = () => {
    setTempSelectedTypes(selectedTypes);
    setTempSelectedTags(selectedTags);
    setTempTitle(title);
    setTempSort(sort);
    setTempAccess(access);
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedTags.length > 0 || title || sort !== "title_asc" || access !== "all";
  const activeFiltersCount = selectedTags.length + (title ? 1 : 0) + (sort !== "title_asc" ? 1 : 0) + (access !== "all" ? 1 : 0);

  async function DeleteBook(bookID) {
    if (!confirm("are you sure want to delete this book?")) { return }

    try {
      const response = await ytkiddAPI.DeleteBook("", {}, {
        book_id: bookID
      })
      if (response.status !== 200) {
        return
      }

      GetBookList(bookParams)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <div>Manage Books</div>
              <Link href="/admin/books/add"><Button size="sm"><PlusIcon />Add Book</Button></Link>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-row gap-3">
        <div className="hidden md:block w-[240px]">
          <Card className="sticky top-14 p-3 w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span>Pencarian</span>
              <Button size="smv2" onClick={applyFilters}>
                <Search /> Cari
              </Button>
            </div>

            <div>
              <Label htmlFor="modal-title" className="text-sm font-medium">
                Cari Judul Buku
              </Label>
              <Input
                id="modal-title"
                type="text"
                placeholder="Masukkan judul buku..."
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              {tagOptions.map((tagGroup) => (
                <div key={tagGroup.name}>
                  <Label>{tagGroup.name}</Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="truncate">
                          {tempSelectedTags.length === 0
                            ? "Select tags..."
                            : `${tempSelectedTags.length} selected`}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="p-4 space-y-2">
                        {tagGroup.tags.map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`modal-tag-${tag}`}
                              checked={tempSelectedTags.includes(tag)}
                              onCheckedChange={(checked) => handleTempTagChange(tag, checked)}
                            />
                            <Label
                              htmlFor={`modal-tag-${tag}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {tag}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Akses</Label>
              <Select value={tempAccess} onValueChange={setTempAccess}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akses..." />
                </SelectTrigger>
                <SelectContent>
                  {accessOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Urutkan</Label>
              <Select value={tempSort} onValueChange={setTempSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan..." />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </Card>
        </div>

        <div className="flex-1">
          {/* Books Grid - Modern Tokopedia-style layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {bookList.map((oneBook) => (
              <div key={oneBook.id} className="group block">
                <div className="bg-white hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden">
                  {/* Square Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={oneBook.cover_file_url}
                      alt={`Cover of ${oneBook.title}`}
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="smv2">{oneBook.is_free ? "FREE" : "PREMIUM"}</Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="outline" size="icon_sm"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuGroup>
                              <Link href={`/books/${oneBook.slug}/read?page=1`}>
                                <DropdownMenuItem>
                                  read
                                  <DropdownMenuShortcut><Eye size={14} /></DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/admin/books/${oneBook.id}/edit`}>
                                <DropdownMenuItem>
                                  edit
                                  <DropdownMenuShortcut><Pencil size={14} /></DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={()=>DeleteBook(oneBook.id)}>
                                delete
                                <DropdownMenuShortcut><Trash size={14} /></DropdownMenuShortcut>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-3">
                    <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight font-medium group-hover:text-blue-600 transition-colors">
                      {oneBook.title}
                    </h3>

                    <div className="mt-2 flex items-center justify-between">
                      {/* <span className="text-xs text-gray-500">Author</span> */}
                      <div className="flex items-center gap-1">
                        <div className="text-xs bg-blue-50 text-gray-800 p-0.5">{oneBook.tags[0]}</div>
                        {/* <span className="text-xs text-gray-600">4.5</span> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {!loading && bookList.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-sm mx-auto">
                <Filter className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
                <Button onClick={clearFilters} variant="outline" className="px-6">
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}