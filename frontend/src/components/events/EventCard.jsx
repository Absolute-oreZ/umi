import { Link } from "react-router-dom";
import { formatTimestamp } from "../../utils";

const EventCard = ({ event }) => {
  const { title, eventLink, eventCreatorUsername, startDate, endDate } = event;

  const formatDate = (date) => (date ? formatTimestamp(date) : "N/A");

  // Common truncation classes for all text fields
  const truncateClasses = "truncate block max-w-full";

  return (
    <div className="my-2 flex flex-col p-3 gap-1.5 w-full bg-white text-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-teal-200 text-sm">
      <h3
        className={`text-base font-semibold text-teal-700 ${truncateClasses}`}
      >
        {title}
      </h3>

      <p className={truncateClasses}>
        <span className="text-gray-500 font-medium">Created by: </span>
        <span className="text-amber-600">{eventCreatorUsername}</span>
      </p>

      {eventLink ? (
        <p className={truncateClasses}>
          <span className="text-gray-500 font-medium">Link: </span>
          <Link
            to={eventLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 truncate"
          >
            {eventLink}
          </Link>
        </p>
      ) : (
        <p className="text-gray-400 italic truncate">No link provided</p>
      )}

      <p className={truncateClasses}>
        <span className="text-gray-500 font-medium">Starts: </span>
        <span className="text-slate-700">{formatDate(startDate)}</span>
      </p>

      <p className={truncateClasses}>
        <span className="text-gray-500 font-medium">Ends: </span>
        <span className="text-slate-700">{formatDate(endDate)}</span>
      </p>
    </div>
  );
};

export default EventCard;
