import { useState, useEffect } from "react";
import useCache from "../../../hooks/useCache";
import useLocalStorage from "../../../hooks/useLocalStorage";
import BlobMediaViewer from "../../../components/common/BlobMediaViewer";
import { TbFileTypeDocx, TbFileTypePdf } from "react-icons/tb";
import { RiFileImageLine, RiFileVideoLine } from "react-icons/ri";
import { HiViewfinderCircle } from "react-icons/hi2";
import { LiaSearchSolid } from "react-icons/lia";

const Downloads = () => {
  const [savedUrls] = useLocalStorage("savedResources", []);
  const { getFromCache } = useCache();
  const [blobs, setBlobs] = useState([]);
  const [filteredBlobs, setFilteredBlobs] = useState([]);
  const [viewedResource, setViewedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const typeOptions = [
    { value: "all", label: "All" },
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "pdf", label: "PDFs" },
    { value: "docx", label: "Docs" },
  ];

  useEffect(() => {
    const loadBlobs = async () => {
      const loaded = await Promise.all(
        savedUrls.map(async (url) => {
          const blob = await getFromCache(url);
          return blob ? { blob, url } : null;
        })
      );
      const validBlobs = loaded.filter(Boolean);
      setBlobs(validBlobs);
      setFilteredBlobs(validBlobs);
    };
    loadBlobs();
  }, [savedUrls]);

  useEffect(() => {
    let items = blobs.filter(({ blob, url }) => {
      const fileName = url.substring(url.lastIndexOf("/") + 1);
      const matchesSearch = fileName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (typeFilter === "all") return matchesSearch;

      const type = getTypeFromBlob(blob);
      return matchesSearch && type === typeFilter;
    });

    setFilteredBlobs(items);

    if (
      viewedResource &&
      !items.some((item) => item.url === viewedResource.url)
    ) {
      setViewedResource(null);
    }
  }, [blobs, searchTerm, typeFilter]);

  const getTypeFromBlob = (blob) => {
    if (blob.type.startsWith("image/")) return "image";
    if (blob.type.startsWith("video/")) return "video";
    if (blob.type === "application/pdf") return "pdf";
    if (
      blob.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "docx";
    return "other";
  };

  const getIcon = (type) => {
    switch (type) {
      case "pdf":
        return <TbFileTypePdf size={24} className="text-red-500" />;
      case "docx":
        return <TbFileTypeDocx size={24} className="text-blue-500" />;
      case "image":
        return <RiFileImageLine size={24} className="text-amber-500" />;
      case "video":
        return <RiFileVideoLine size={24} className="text-teal-500" />;
      default:
        return <div className="w-6 h-6 bg-gray-400 rounded-full" />;
    }
  };

  const getFileName = (url) => {
    return url.substring(url.lastIndexOf("/") + 1);
  };

  return (
    <div className="w-full text-white p-6 h-screen">
      <div className="flex flex-col border border-dark-100 rounded-md h-full overflow-hidden">
        <div className="pt-3 px-4 flex items-center justify-between bg-gray-700 border-b border-dark-100 rounded-t-md">
          <h2 className="text-lg font-semibold">Downloads</h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {typeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTypeFilter(value)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    typeFilter === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1 rounded-full bg-gray-800 text-light-200 border border-gray-500 focus:outline-none"
              />
              <div className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                <LiaSearchSolid />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Left Panel - Resource List (smaller) */}
          <div className="w-1/4 overflow-y-auto bg-gray-800 border-r border-dark-100">
            {filteredBlobs.length > 0 ? (
              filteredBlobs.map(({ blob, url }, idx) => {
                const fileName = getFileName(url);
                const type = getTypeFromBlob(blob);

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-dark-100 hover:bg-gray-700 cursor-pointer ${
                      viewedResource?.url === url ? "bg-gray-700" : ""
                    }`}
                    onClick={() => setViewedResource({ blob, url })}
                  >
                    {getIcon(type)}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{fileName}</p>
                      <p className="text-xs text-gray-400 capitalize">{type}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-400">
                {blobs.length === 0
                  ? "No saved resources found"
                  : "No resources match your search"}
              </div>
            )}
          </div>

          {/* Right Panel - Preview (larger) */}
          <div className="w-3/4 overflow-y-auto p-4 bg-gray-900">
            {viewedResource ? (
              <div className="flex flex-col h-full">
                <div className="mb-4 pb-2 border-b border-gray-700">
                  <h3 className="text-lg font-semibold truncate">
                    {getFileName(viewedResource.url)}
                  </h3>
                </div>
                <div className="flex-1 min-h-0">
                  <BlobMediaViewer blob={viewedResource.blob} />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                    <HiViewfinderCircle size={24} />
                  </div>
                  <p>Select a resource to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
