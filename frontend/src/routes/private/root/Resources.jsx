import { useState, useEffect } from "react";
import { TbFileTypeDocx, TbFileTypePdf } from "react-icons/tb";
import ResourcePageSkeleton from "../../../skeletons/ResourcesSkeleton";
import { customFetch } from "../../../api/fetchInstance";
import { formatTimestamp } from "../../../utils";

const categories = [
  { label: "All", value: "" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Docx", value: "docx" },
  { label: "PDF", value: "pdf" },
];

const Resource = () => {
  const [resources, setResources] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchResources = async (searchQuery, searchCategory) => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (searchCategory) params.append("category", searchCategory);

      const response = await customFetch(
        `/resources/query?${params.toString()}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();

      console.log(data);
      setResources(data);
    } catch (error) {
      console.error("Failed to fetch resources", error);
      setResources([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
    fetchResources(query, category);
  };

  useEffect(() => {
    if (hasSearched) {
      fetchResources(query, category);
    }
  }, [category]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadStatus("");
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "video/mp4",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus(
        "Unsupported file type. Please select a supported file."
      );
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await customFetch("/resources/new", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadStatus("Upload successful!");
      setFile(null);

      if (hasSearched) fetchResources(query, category);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Failed to upload the file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!hasSearched && isUploading) {
    return <ResourcePageSkeleton />;
  }

  return (
    <div className="min-h-screen p-6 font-sans flex justify-center">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-10">
        <div
          className={`flex-1 p-6 flex flex-col justify-center ${
            hasSearched && "justify-start"
          }`}
        >
          <div className="flex items-center justify-center">
            <img src="icons/logo.png" className="w-20 h-20" />
            <h1>UMI Resource Library</h1>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className={`flex flex-col sm:flex-row items-center gap-4 my-6`}
          >
            <input
              type="text"
              className="w-full sm:flex-grow border border-gray-300 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Search resources..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="mt-3 sm:mt-0 bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={query.trim() === ""}
            >
              Search
            </button>
          </form>

          {hasSearched && (
            <div className="mb-6 flex flex-wrap gap-3">
              {categories.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
                    ${
                      category === value
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {hasSearched ? (
            <div className="overflow-y-auto max-h-[500px]">
              {resources.length > 0 ? (
                <ul className="space-y-6">
                  {resources.map((res) => {
                    const isImage = res.category === "IMAGE";
                    const isVideo = res.category === "VIDEO";

                    const createdDate = formatTimestamp(res.createdDate);

                    return (
                      <li
                        key={res.id}
                        className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-100 rounded-md transition"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                            {isImage ? (
                              <img
                                src={res.resourcePath}
                                alt={res.name}
                                className="object-cover w-full h-full"
                              />
                            ) : isVideo ? (
                              <video
                                src={res.resourcePath}
                                className="w-full h-full object-cover"
                                muted
                                preload="metadata"
                              />
                            ) : res.category === "docx" ? (
                              <TbFileTypeDocx
                                size={36}
                                className="text-blue-600"
                              />
                            ) : res.category === "PDF" ? (
                              <TbFileTypePdf
                                size={36}
                                className="text-red-600"
                              />
                            ) : (
                              <div className="text-gray-400">N/A</div>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <a
                              href={res.resourcePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg text-blue-800 font-semibold hover:underline"
                            >
                              {res.name}
                            </a>
                            <span className="text-sm text-gray-600 capitalize mt-1">
                              Type: {res.category.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {createdDate}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 text-center mt-12 italic">
                  No resources found.
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <p className="text-3xl text-slate-300">
                Dancing in the light of ancient wisdom
              </p>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3 bg-gray-600 rounded-lg shadow-lg p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
            Upload Resource
          </h2>

          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <label
              htmlFor="fileInput"
              className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-10 text-center text-gray-400 hover:border-purple-500 hover:text-purple-600 transition"
            >
              {file ? (
                <p className="text-gray-700 font-medium truncate">{file.name}</p>
              ) : (
                <p>Click or drag file here to upload</p>
              )}
              <input
                id="fileInput"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.docx,.mp4"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={!file || isUploading}
              className={`w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {uploadStatus && (
            <p
              className={`mt-4 text-center text-sm ${
                uploadStatus.includes("Failed")
                  ? "text-red-600"
                  : uploadStatus.includes("Unsupported")
                  ? "text-yellow-600"
                  : "text-green-600"
              } font-medium`}
            >
              {uploadStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resource;
