import { useState } from "react";
import EventCard from "./EventCard";
import { toast, Slide } from "react-toastify";

const EventContainer = ({
  openEventContainer,
  closeEventContainer,
  upcomingEvents,
  handleCreateNewEvent,
}) => {
  const today = new Date().toISOString().slice(0, 16);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [notifyMembers, setNotifyMembers] = useState(false);
  const [remindMembers, setRemindMembers] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [remindBeforeInMinutes, setRemindBeforeInMinutes] = useState(0);

  const resetForm = () => {
    setTitle("");
    setEventLink("");
    setNotifyMembers(false);
    setRemindMembers(false);
    setStartDate(null);
    setEndDate(null);
    setRemindBeforeInMinutes(0);
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "EventContainer") {
      closeEventContainer();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Creating event...");

    const validations = [
      [!title, "Please enter a title for the event."],
      [
        remindMembers && remindBeforeInMinutes <= 0,
        "Please specify when to remind members.",
      ],
    ];

    for (const [condition, message] of validations) {
      if (condition) {
        toast.update(toastId, {
          render: message,
          type: "error",
          isLoading: false,
          theme: "dark",
          position: "top-right",
          autoClose: 3000,
          closeOnClick: true,
          closeButton: true,
          transition: Slide,
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      const newEventData = {
        title: title,
        eventLink: eventLink,
        notifyMembers: notifyMembers,
        remindMembers: remindMembers,
        startDate: startDate,
        endDate: endDate,
        remindBeforeInMinutes: remindBeforeInMinutes,
      };

      await handleCreateNewEvent(newEventData);

      toast.update(toastId, {
        render: "Event created successfully!",
        type: "success",
        isLoading: false,
        closeOnClick: true,
        closeButton: true,
        pauseOnHover: true,
        theme: "dark",
        autoClose: 3000,
        transition: Slide,
      });

      resetForm();
      closeEventContainer();
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to create the event.",
        type: "error",
        isLoading: false,
        theme: "dark",
        closeOnClick: true,
        closeButton: true,
        pauseOnHover: true,
        transition: Slide,
        autoClose: 3000,
      });
      console.error("Error creating event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!openEventContainer) return null;

  return (
    <div
      id="EventContainer"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black opacity-90 flex justify-center items-center bg-opacity-20 backdrop-blur-sm z-1 transition-opacity duration-300 overlay"
    >
      <div className="flex w-230 max-lg:flex-col gap-4 bg-gray-800 p-6 rounded-md shadow-lg transition-all duration-500 ease-out z-50">
        <div className="flex flex-col p-3 w-full lg:w-1/2">
          <h3 className="text-2xl font-semibold mb-2 text-white">
            Upcoming Events
          </h3>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="flex flex-col w-full h-full justify-between">
              <p>No events yet, go ahead and create one</p>
              <p className="font-bold text-xl text-rose-400 text-center">
                "Be the first to do something and you will pave the way for
                others."{" "}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col p-3 w-full lg:w-1/2">
          <h3 className="text-2xl font-semibold mb-3 text-white">
            Schedule a New Event
          </h3>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4 w-full">
              <label className="block text-sm font-semibold text-white mb-1">
                Title
              </label>
              <input
                autoComplete="off"
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter the event title"
              />
            </div>

            <div className="mb-4 w-full">
              <label className="text-sm font-semibold text-white mb-1">
                Event Link (Optional)
              </label>
              <input
                autoComplete="off"
                type="text"
                name="eventLink"
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Link for the event"
              />
            </div>

            <div className="flex gap-2 mb-4 w-full">
              <div>
                <label className="text-sm font-semibold text-white mb-1">
                  Starts (Optional)
                </label>
                <input
                  autoComplete="off"
                  type="datetime-local"
                  name="startDate"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-51 p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-white mb-1">
                  Ends (Optional)
                </label>
                <input
                  autoComplete="off"
                  type="datetime-local"
                  name="endDate"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-51 p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <input
                id="notifyMembers"
                name="notifyMembers"
                type="checkbox"
                checked={notifyMembers}
                onChange={() => setNotifyMembers((prev) => !prev)}
              />
              <label htmlFor="notifyMembers" className="text-white">
                Notify others about this event
              </label>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  id="remindMembers"
                  name="remindMembers"
                  type="checkbox"
                  checked={remindMembers}
                  onChange={() => {
                    setRemindMembers((prev) => !prev);
                    if (!remindMembers && remindBeforeInMinutes <= 0) {
                      setRemindBeforeInMinutes(10);
                    }
                  }}
                />
                <label htmlFor="remindMembers" className="text-white">
                  Remind others
                </label>

                {remindMembers && (
                  <div className="flex items-center gap-1 h-2 -ml-1">
                    <label
                      htmlFor="remindBeforeInMinutes"
                      className="text-white"
                    >
                      in
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setRemindBeforeInMinutes((prev) =>
                            Math.max(1, prev - 5)
                          )
                        }
                        className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                      >
                        -
                      </button>
                      <input
                        id="remindBeforeInMinutes"
                        name="remindBeforeInMinutes"
                        type="number"
                        min="1"
                        max="60"
                        value={remindBeforeInMinutes}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            setRemindBeforeInMinutes(
                              Math.min(60, Math.max(1, val))
                            );
                          }
                        }}
                        className="w-12 p-1 text-center border border-gray-300 rounded-md 
          [&::-webkit-outer-spin-button]:appearance-none 
          [&::-webkit-inner-spin-button]:appearance-none 
          [appearance:textfield]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRemindBeforeInMinutes((prev) =>
                            Math.min(60, prev + 5)
                          )
                        }
                        className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                      >
                        +
                      </button>
                      <span className="text-white">minutes before</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={closeEventContainer}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-red-600 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-purple-400 text-white rounded-md hover:bg-purple-700"
              >
                {isLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventContainer;
