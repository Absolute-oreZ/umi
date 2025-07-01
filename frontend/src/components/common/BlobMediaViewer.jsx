import { useEffect, useState } from "react";

const BlobMediaViewer = ({ blob }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!url) return null;

  const type = blob.type;
  if (type.startsWith("image/"))
    return <img src={url} alt="Saved" width={300} />;
  if (type.startsWith("video/"))
    return <video src={url} controls width={400} />;
  if (type === "application/pdf")
    return <embed src={url} width="400" height="500" type="application/pdf" />;

  return <p>Unsupported file type: {type}</p>;
};

export default BlobMediaViewer;
