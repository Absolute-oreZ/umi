import { useState, useEffect } from "react";
import ResourceCard from "../../../components/resource/ResourceCard";
import { customFetch } from "../../../api/fetchInstance";
import ResourceUploader from "../../../components/resource/ResourceUploader";
import { getMediaTypeFromExtension, validateFileSize } from "../../../utils";
import { useWebSocket } from "../../../context/WebSocketContext";
import PaginationControl from "../../../components/common/PaginationControl";
import { useSessionState } from "../../../hooks/useSessionState";

const categories = [
  { label: "All", value: "" },
  { label: "Image", value: "IMAGE" },
  { label: "Video", value: "VIDEO" },
  { label: "Docx", value: "DOCS" },
  { label: "PDF", value: "PDF" },
];

const Resource = () => {
  const { currentGroups, handleMessageSent } = useWebSocket();
  const [query, setQuery] = useSessionState("umi-query", "");
  const [category, setCategory] = useSessionState("umi-category", "");
  const [hasSearched, setHasSearched] = useSessionState(
    "umi-hasSearched",
    false
  );
  const [currentPage, setCurrentPage] = useSessionState("umi-currentPage", 0);

  const [resources, setResources] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState();

  const [file, setFile] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (category) params.append("category", category);
      params.append("page", currentPage);

      const response = await customFetch(
        `/resources/query?${params.toString()}`
      );
      const data = await response.json();

      setResources(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to fetch resources", error);
      setResources([]);
    }
  };

  useEffect(() => {
    if (hasSearched) fetchResources();
  }, [category, currentPage]);

  useEffect(() => {
    if (hasSearched) fetchResources();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
    setCurrentPage(0);
    fetchResources();
  };

  const handleForwardResource = async (mediaUrl, groupId) => {
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    const fileName = mediaUrl.split("/").pop().split("?")[0] || "file";
    const media = new File([blob], fileName, { type: blob.type });
    const type = getMediaTypeFromExtension(media.name);
    await handleMessageSent("", media, type, groupId);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadStatus("");

    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    const validateResult = validateFileSize(file, 10 * 1024 * 1024);
    if (!validateResult.isValid) {
      setUploadStatus("Failed to upload resource: " + validateResult.message);
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video/mp4",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus("Unsupported file type. Please select a supported file.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (renameText.trim() !== "") {
        formData.append("renameText", renameText);
      }

      const response = await customFetch("/resources/new", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setUploadStatus("Upload successful!");
      setRenameText("");
      setFile(null);

      if (hasSearched) fetchResources();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Failed to upload the file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen p-6 font-sans flex justify-center">
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
            className="flex flex-col sm:flex-row items-center gap-4 my-6"
          >
            <input
              type="text"
              required
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    category === value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {hasSearched ? (
            <div className="no-scrollbar max-h-[500px]">
              {resources.length > 0 ? (
                <div className="flex flex-col">
                  <ul className="space-y-6">
                    {resources.map((res) => (
                      <li
                        key={res.id}
                        className="border-b border-gray-200 rounded-md transition"
                      >
                        <ResourceCard
                          res={res}
                          currentGroups={currentGroups}
                          handleForwardResource={handleForwardResource}
                        />
                      </li>
                    ))}
                  </ul>
                  <PaginationControl
                    currentPage={currentPage}
                    totalCount={totalElements}
                    pageSize={3}
                    onPageChange={(page) => setCurrentPage(page)}
                    totalPages={totalPages}
                  />
                </div>
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

        <ResourceUploader
          handleUpload={handleUpload}
          uploadStatus={uploadStatus}
          isUploading={isUploading}
          file={file}
          setFile={setFile}
          renameText={renameText}
          setRenameText={setRenameText}
        />
      </div>
    </div>
  );
};

export default Resource;
