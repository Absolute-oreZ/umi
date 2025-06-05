const MessageToast = ({ icon, title, content, handleToastMessageClick }) => {
  return (
    <div className="flex items-start gap-3" onClick={handleToastMessageClick}>
      <img
        src={icon}
        alt="icon"
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="font-semibold text-purple-600 truncate text-sm">
          {title}
        </span>
        <span className="text-sm text-light-100 truncate max-w-[200px]">
          {content}
        </span>
      </div>
    </div>
  );
};

export default MessageToast;