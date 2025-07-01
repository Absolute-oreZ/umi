import { useEffect, useState } from "react";
import mammoth from "mammoth";

const BlobMediaViewer = ({ blob }) => {
  const [url, setUrl] = useState(null);
  const [docxHtml, setDocxHtml] = useState(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    if (
      blob.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Read and convert DOCX content using mammoth
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const { value } = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHtml(value);
      };
      reader.readAsArrayBuffer(blob);
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  if (!url)
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );

  const type = blob.type;

  if (type.startsWith("image/")) {
    return (
      <div className="flex items-center justify-center h-full">
        <img
          src={url}
          alt="Saved"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  if (type.startsWith("video/")) {
    return (
      <div className="flex items-center justify-center h-full">
        <video src={url} controls className="max-w-full max-h-full" />
      </div>
    );
  }

  if (type === "application/pdf") {
    return (
      <div className="h-full w-full">
        <embed
          src={url + "#toolbar=0&navpanes=0&scrollbar=0"}
          width="100%"
          height="100%"
          type="application/pdf"
          className="rounded shadow-md"
        />
      </div>
    );
  }

  if (
    type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return (
      <div className="prose max-w-none text-white bg-gray-900 p-4 rounded shadow-md overflow-auto h-full">
        {docxHtml ? (
          <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
        ) : (
          <p>Loading document...</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-white p-4 border border-gray-600 rounded-md bg-gray-800">
      <p className="mb-2">Unsupported file type: {type}</p>
    </div>
  );
};

export default BlobMediaViewer;
