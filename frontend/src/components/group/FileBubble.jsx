import { TbFileTypePdf, TbFileTypeDocx } from "react-icons/tb";
import { getFileNameFromPath } from "../../utils";

const FILE_TYPE_DETAILS = {
  PDF: {
    icon: <TbFileTypePdf className="w-8 h-8" />,
    label: "PDF File",
  },
  DOCX: {
    icon: <TbFileTypeDocx className="w-8 h-8" />,
    label: "Microsoft Word 97 - 2003 Document",
  },
};

const FileBubble = ({ filePath, fileType }) => {
  const formattedPath = filePath ? filePath : "";
  const { icon, label } = FILE_TYPE_DETAILS[fileType] || {};

  return (
    <div className="file-bubble">
      <div className="file-info">
        {icon}
        <div>
          <p className="font-semibold text-sm truncate max-w-[160px]">
            {getFileNameFromPath(filePath)}
          </p>
          <p className="text-xs text-gray-200">{label}</p>
        </div>
      </div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={formattedPath}
        className="download-button"
      >
        Download
      </a>
    </div>
  );
};

export default FileBubble;
