import ytkiddAPI from "@/apis/ytkidApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Filter, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

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
  const [loading, setLoading] = useState(false);

  // Temporary filter states for modal (before applying)
  const [tempSelectedTypes, setTempSelectedTypes] = useState(["default"]);
  const [tempSelectedTags, setTempSelectedTags] = useState([]);
  const [tempTitle, setTempTitle] = useState("");
  const [tempSort, setTempSort] = useState("title_asc");

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

  // Initialize filters from URL params
  useEffect(() => {
    const urlTypes = searchParams.get("types");
    const urlTags = searchParams.get("tags");
    const urlTitle = searchParams.get("title");
    const urlSort = searchParams.get("sort");

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
    GetBookList(params);
  }, [selectedTypes, selectedTags, title, sort]);

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
      if (body.data.tags) {
        setTagOptions(body.data.tags.map((v) => ({value: v, label: v})))
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleTempTypeChange = (typeValue, checked) => {
    if (checked) {
      setTempSelectedTypes(prev => [...prev, typeValue]);
    } else {
      setTempSelectedTypes(prev => prev.filter(t => t !== typeValue));
    }
  };

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
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    const defaultValues = {
      types: ["default"],
      tags: [],
      title: "",
      sort: "title_asc"
    };

    setSelectedTypes(defaultValues.types);
    setSelectedTags(defaultValues.tags);
    setTitle(defaultValues.title);
    setSort(defaultValues.sort);

    setTempSelectedTypes(defaultValues.types);
    setTempSelectedTags(defaultValues.tags);
    setTempTitle(defaultValues.title);
    setTempSort(defaultValues.sort);
  };

  const resetTempFilters = () => {
    setTempSelectedTypes(selectedTypes);
    setTempSelectedTags(selectedTags);
    setTempTitle(title);
    setTempSort(sort);
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedTags.length > 0 || title || sort !== "title_asc";
  const activeFiltersCount = selectedTags.length + (title ? 1 : 0) + (sort !== "title_asc" ? 1 : 0);

  return (
    <main className="">
      {/* Filter Button and Active Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  resetTempFilters();
                  setIsFilterModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Filter Books</DialogTitle>
                <DialogDescription>
                  Adjust your search criteria to find the perfect books.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Title Search */}
                <div>
                  <Label htmlFor="modal-title" className="text-sm font-medium">
                    Search Title
                  </Label>
                  <Input
                    id="modal-title"
                    type="text"
                    placeholder="Enter book title..."
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Types Dropdown */}
                {/* <div>
                  <Label className="text-sm font-medium mb-2 block">Book Types</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="truncate">
                          {tempSelectedTypes.length === 0
                            ? "Select types..."
                            : `${tempSelectedTypes.length} selected`}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="p-4 space-y-2">
                        {typeOptions.map((type) => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`modal-type-${type.value}`}
                              checked={tempSelectedTypes.includes(type.value)}
                              onCheckedChange={(checked) => handleTempTypeChange(type.value, checked)}
                            />
                            <Label
                              htmlFor={`modal-type-${type.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div> */}

                {/* Tags Dropdown */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tags</Label>
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
                        {tagOptions.map((tag) => (
                          <div key={tag.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`modal-tag-${tag.value}`}
                              checked={tempSelectedTags.includes(tag.value)}
                              onCheckedChange={(checked) => handleTempTagChange(tag.value, checked)}
                            />
                            <Label
                              htmlFor={`modal-tag-${tag.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {tag.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Sort Select */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                  <Select value={tempSort} onValueChange={setTempSort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
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
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {loading && <LoadingSpinner />}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                Tag: {tagOptions.find(t => t.value === tag)?.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                />
              </Badge>
            ))}
            {title && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                Title: "{title}"
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => setTitle("")}
                />
              </Badge>
            )}
            {sort !== "title_asc" && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                Sort: {sortOptions.find(s => s.value === sort)?.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => setSort("title_asc")}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {bookList.map((oneBook) => (
          <Link
            href={`/books/${oneBook.id}/read?page=1`}
            key={oneBook.id}
            className="group"
          >
            <div className="bg-zinc-50 border border-gray-200 rounded-lg shadow-md hover:shadow-md hover:shadow-accent flex flex-col h-full">
              <div className="relative overflow-hidden rounded-lg border border-accent">
                <img
                  className="w-full h-64 object-cover rounded-lg"
                  src={oneBook.cover_file_url}
                  alt={`Cover of ${oneBook.title}`}
                  loading="lazy"
                />
                {oneBook.is_free && (
                  <div className="absolute top-1.5 right-1.5 text-xs py-0.5 px-1.5 rounded-full bg-black text-white">
                    free
                  </div>
                )}
              </div>
              <div className="mt-0.5 p-1 flex-1 flex flex-col justify-between">
                <div className="text-black truncate font-sans">
                  {oneBook.title}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {!loading && bookList.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
          <Button onClick={clearFilters} variant="outline">
            Clear all filters
          </Button>
        </div>
      )}
    </main>
  );
}