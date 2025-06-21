const ResourceUploader = ({
  handleUpload,
  isUploading,
  uploadStatus,
  file,
  renameText,
  setFile,
  setRenameText,
}) => {
  return (
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

        <label
          htmlFor="renameInput"
          className="-mb-3 mt-3"
        >
            Rename File (Optional)
        </label>
        <input
            id="renameInput"
            type="text"
            autoComplete="off"
            value={renameText}
            onChange={(e) => setRenameText(e.target.value)}
            placeholder="New file name"
            className="w-full sm:flex-grow border border-gray-300 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

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
  );
};

export default ResourceUploader;
