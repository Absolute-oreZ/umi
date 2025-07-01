import { useState, useEffect, useRef } from "react";
import { toast, Zoom } from "react-toastify";
import { BiFilterAlt, BiSortAlt2 } from "react-icons/bi";
import { IoIosArrowBack } from "react-icons/io";
import { LiaSearchSolid } from "react-icons/lia";
import { RiResetLeftLine, RiUserCommunityLine } from "react-icons/ri";
import { FaSortAmountUp, FaSortAmountDown } from "react-icons/fa";
import { LuActivity } from "react-icons/lu";
import {
  MdCancel,
  MdDelete,
  MdEdit,
  MdOutlinePerson,
  MdSave,
} from "react-icons/md";
import { GoLinkExternal } from "react-icons/go";
import Loader from "../../../components/common/Loader";
import { customFetch } from "../../../api/fetchInstance";
import { useWebSocket } from "../../../context/WebSocketContext";
import { formatTimestamp } from "../../../utils";
import { useAuth } from "../../../context/AuthContext";
import { GrStatusGood } from "react-icons/gr";

const Events = () => {
  const today = new Date().toISOString().slice(0, 16);

  const { user } = useAuth();
  const { currentGroups } = useWebSocket();

  const formRef = useRef();
  const sortMenuRef = useRef(null);
  const filterMenuRef = useRef(null);
  const deleteMenuRef = useRef(null);

  const [isFetchingEvents, setIsFetchingEvents] = useState(false);
  const [viewedEvent, setViewedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setfilteredEvents] = useState([]);

  // sort state
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortItem, setSortItem] = useState("none");
  const [sortOrder, setSortOrder] = useState("ascending");

  // filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [viewedGroup, setVieweGroup] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [matchMode, setMatchMode] = useState("all");
  const [statusFilter, setStatusFilter] = useState({
    condition: "is",
    value: "all",
  });
  const [creatorFilter, setCreatorFilter] = useState({
    condition: "is",
    value: "all",
  });

  // edit event state
  const [isEditing, setIsEditing] = useState(false);
  const [notifyChanges, setnotifyChanges] = useState(false);

  // delete event state
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [notifyDeletion, setNotifyDeletion] = useState(false);

  // options
  const statusOptions = ["all", "upcoming", "ongoing", "ended"];
  const creatorOptions = ["all", "me", "others"];
  const sortOptions = [
    { value: "none", label: "None" },
    { value: "starts", label: "Starts" },
    { value: "ends", label: "Ends" },
    { value: "title", label: "Title" },
  ];

  const activeFilterCount =
    (statusFilter.value !== "all" ? 1 : 0) +
    (creatorFilter.value !== "all" ? 1 : 0);

  // load persisted state from sessionStorage on mount
  useEffect(() => {
    fetchEvents();
    const savedViewedGroup = sessionStorage.getItem("viewedGroup");
    const savedViewedEvent = sessionStorage.getItem("viewedEvent");
    const savedSortItem = sessionStorage.getItem("sortItem");
    const savedSortOrder = sessionStorage.getItem("sortOrder");
    const savedStatusFilter = sessionStorage.getItem("statusFilter");
    const savedCreatorFilter = sessionStorage.getItem("creatorFilter");
    const savedMatchMode = sessionStorage.getItem("matchMode");

    if (savedViewedGroup) setVieweGroup(JSON.parse(savedViewedGroup));
    if (savedViewedEvent) setViewedEvent(JSON.parse(savedViewedEvent));
    if (savedSortItem) setSortItem(savedSortItem);
    if (savedSortOrder) setSortOrder(savedSortOrder);
    if (savedStatusFilter) setStatusFilter(JSON.parse(savedStatusFilter));
    if (savedCreatorFilter) setCreatorFilter(JSON.parse(savedCreatorFilter));
    if (savedMatchMode) setMatchMode(savedMatchMode);
  }, []);

  // filtering & sorting logic
  useEffect(() => {
    let items = events.filter((event) => {
      const filters = [];

      const matchGroup = viewedGroup ? event.groupId === viewedGroup.id : true;
      const matchTitle = event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      filters.push(matchGroup && matchTitle);

      if (statusFilter.value !== "all") {
        const matchStatus = event.status === statusFilter.value;
        filters.push(
          statusFilter.condition === "is" ? matchStatus : !matchStatus
        );
      }

      if (creatorFilter.value !== "all") {
        const isMe = event.eventCreatorUsername === user.username;
        const matchCreator =
          creatorFilter.value === "me"
            ? isMe
            : !isMe && event.eventCreatorUsername;
        filters.push(
          creatorFilter.condition === "is" ? matchCreator : !matchCreator
        );
      }

      return matchMode === "all"
        ? filters.every(Boolean)
        : filters.some(Boolean);
    });

    if (sortItem === "none") {
      items = items.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
    } else if (sortItem === "title") {
      items = items.sort((a, b) => {
        if (!a.title) return 1;
        if (!b.title) return -1;
        return sortOrder === "ascending"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
    } else {
      const key = sortItem === "starts" ? "startDate" : "endDate";
      items = items.sort((a, b) => {
        const A = new Date(a[key] || 0);
        const B = new Date(b[key] || 0);
        return sortOrder === "ascending" ? A - B : B - A;
      });
    }

    setfilteredEvents(items);
  }, [
    events,
    viewedGroup,
    searchTerm,
    statusFilter,
    creatorFilter,
    matchMode,
    sortItem,
    sortOrder,
    viewedEvent,
    user.username,
  ]);

  // save viewedGroup to sessionStorage on change
  useEffect(() => {
    if (viewedGroup) {
      sessionStorage.setItem("viewedGroup", JSON.stringify(viewedGroup));
    } else {
      sessionStorage.removeItem("viewedGroup");
    }
  }, [viewedGroup]);

  // save viewedEvent to sessionStorage on change
  useEffect(() => {
    if (viewedEvent) {
      sessionStorage.setItem("viewedEvent", JSON.stringify(viewedEvent));
    } else {
      sessionStorage.removeItem("viewedEvent");
    }
  }, [viewedEvent]);

  // save sortItem to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("sortItem", sortItem);
  }, [sortItem]);

  // save sortOrder to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("sortOrder", sortOrder);
  }, [sortOrder]);

  // save statusFilter to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("statusFilter", JSON.stringify(statusFilter));
  }, [statusFilter]);

  // save creatorFilter to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("creatorFilter", JSON.stringify(creatorFilter));
  }, [creatorFilter]);

  // save matchMode to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("matchMode", matchMode);
  }, [matchMode]);

  // handle clicking outside sort and filter menu to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setFilterMenuOpen(false);
      }
      if (
        deleteMenuRef.current &&
        !deleteMenuRef.current.contains(event.target)
      ) {
        setDeleteMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // utility functions
  const getSortLabel = () => {
    if (sortItem === "none") return null;
    const labelMap = {
      starts: "Starts",
      ends: "Ends",
      title: "Title",
    };
    return (
      <div className="flex items-center gap-2">
        {sortOrder === "ascending" ? <FaSortAmountUp /> : <FaSortAmountDown />}
        {labelMap[sortItem]}
      </div>
    );
  };

  const handleResetFilters = () => {
    setStatusFilter({ condition: "is", value: "all" });
    setCreatorFilter({ condition: "is", value: "all" });
    setMatchMode("all");
  };

  const fetchEvents = async () => {
    setIsFetchingEvents(true);
    try {
      const response = await customFetch("/events/current");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events for current user: ", error);
    } finally {
      setIsFetchingEvents(false);
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    const newTitle = data.get("title");
    const newStartDate = data.get("startDate");
    const newEndDate = data.get("endDate");
    const newEventLink = data.get("eventLink");

    const newEventData = {
      title: newTitle,
      eventLink: newEventLink,
      notifyChanges: notifyChanges,
      startDate: newStartDate,
      endDate: newEndDate,
    };

    try {
      await customFetch(`/events/edit/${viewedEvent.id}`, {
        method: "PATCH",
        body: JSON.stringify(newEventData),
      });

      const updatedEvents = events.map((event) =>
        event.id === viewedEvent.id ? { ...event, ...newEventData } : event
      );

      setEvents(updatedEvents);

      setViewedEvent((prev) => ({
        ...prev,
        ...newEventData,
      }));

      setIsEditing(false);

      toast.success(`Successfully update event ${viewedEvent.title}!`, {
        closeOnClick: true,
        closeButton: true,
        type: "success",
        isLoading: false,
        theme: "dark",
        autoClose: 3000,
        transition: Zoom,
      });

      fetchEvents();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Failed to update event ${viewedEvent.title}!`, {
        closeOnClick: true,
        closeButton: true,
        type: "error",
        isLoading: false,
        theme: "dark",
        autoClose: 3000,
        transition: Zoom,
      });
    }
  };

  const handleDeleteEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("notifyDeletion", notifyDeletion);

      await customFetch(`/events/delete/${viewedEvent.id}`, {
        method: "DELETE",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Event deletion failed");
      }

      setEvents((prev) => prev.filter((event) => event.id !== viewedEvent.id));
      setViewedEvent(null);

      toast.success(`Successfully deleted event ${viewedEvent.title}!`, {
        closeOnClick: true,
        closeButton: true,
        type: "success",
        isLoading: false,
        theme: "dark",
        autoClose: 3000,
        transition: Zoom,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete event ${viewedEvent.title}!`, {
        closeOnClick: true,
        closeButton: true,
        type: "error",
        isLoading: false,
        theme: "dark",
        autoClose: 3000,
        transition: Zoom,
      });
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    formRef.current.reset();
    setIsEditing(false);
  };

  return (
    <div className="w-full text-white p-6">
      <div className="flex flex-col border border-dark-100 rounded-md h-[90vh] overflow-hidden">
        <div className="py-3 px-4 flex items-center justify-between bg-gray-700 border-b border-dark-100 rounded-t-md">
          <div className="flex items-center gap-2">
            <button
              disabled={!viewedGroup}
              className="p-1 rounded-md text-xl font-semibold disabled:cursor-auto disabled:text-gray-400 hover:bg-gray-800"
              onClick={() =>
                viewedEvent ? setViewedEvent(null) : setVieweGroup(null)
              }
            >
              <IoIosArrowBack />
            </button>
            <p className="text-lg font-semibold">
              {viewedGroup
                ? viewedEvent
                  ? viewedEvent.title
                  : viewedGroup.name
                : "Events"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen((o) => !o)}
                className={`flex items-center group hover:cursor-pointer bg-gray-800 gap-2 ${
                  sortItem !== "none"
                    ? "text-amber-300 rounded-xl px-3 py-1.5"
                    : "text-light-200 rounded-full p-2"
                }`}
              >
                {sortItem === "none" ? (
                  <BiSortAlt2 size={20} />
                ) : (
                  getSortLabel()
                )}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-1 transition-all duration-300 pointer-events-none z-20">
                  Sorted by ${sortItem}
                </span>
              </button>

              {sortMenuOpen && (
                <div
                  ref={sortMenuRef}
                  className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50"
                >
                  {sortOptions.map(({ value, label }) => (
                    <div
                      key={value}
                      className="flex justify-between items-center px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                      onClick={() => {
                        setSortItem(value);
                        setSortOrder("ascending");
                      }}
                    >
                      <span className="capitalize">{label}</span>
                      {sortItem === value && value !== "none" && (
                        <span
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSortOrder((prev) =>
                              prev === "ascending" ? "descending" : "ascending"
                            );
                          }}
                        >
                          {sortOrder === "ascending" ? (
                            <FaSortAmountUp />
                          ) : (
                            <FaSortAmountDown />
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-100" />

            <div className="relative">
              <button
                onClick={() => setFilterMenuOpen((o) => !o)}
                className={`flex items-center gap-2 bg-gray-800 group hover:cursor-pointer  ${
                  activeFilterCount
                    ? "text-amber-300 rounded-xl px-3 py-1.5"
                    : "text-light-200 p-2 rounded-full"
                }`}
              >
                <BiFilterAlt size={20} />
                {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-1 transition-all duration-300 pointer-events-none z-20">
                  Filtered by {activeFilterCount} rules
                </span>
              </button>

              {filterMenuOpen && (
                <div
                  ref={filterMenuRef}
                  className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 p-4 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <label className="block text-sm mb-1">Match</label>
                    <select
                      value={matchMode}
                      onChange={(e) => setMatchMode(e.target.value)}
                      className="bg-slate-50 text-black rounded-md p-1 focus:outline-none"
                    >
                      <option value="all">All</option>
                      <option value="any">Any</option>
                    </select>
                    <label className="block text-sm mb-1">
                      of the following filters:
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <GrStatusGood className="text-light-200" />
                    <label className="block  w-1/5 font-semibold text-light-200">
                      Status
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter.condition}
                        onChange={(e) =>
                          setStatusFilter((prev) => ({
                            ...prev,
                            condition: e.target.value,
                          }))
                        }
                        className="bg-slate-50 text-black rounded-md px-2 py-1 focus:outline-none"
                      >
                        <option value="is">is</option>
                        <option value="is not">is not</option>
                      </select>
                      <select
                        value={statusFilter.value}
                        onChange={(e) =>
                          setStatusFilter((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        className="bg-slate-50 w-28 text-black rounded-md px-2 py-1 focus:outline-none"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <MdOutlinePerson className="text-light-200" />
                    <label className="block w-1/5 font-semibold text-light-200">
                      Creator
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={creatorFilter.condition}
                        onChange={(e) =>
                          setCreatorFilter((prev) => ({
                            ...prev,
                            condition: e.target.value,
                          }))
                        }
                        className="bg-slate-50 text-black rounded-md px-2 py-1 focus:outline-none"
                      >
                        <option value="is">is</option>
                        <option value="is not">is not</option>
                      </select>
                      <select
                        value={creatorFilter.value}
                        onChange={(e) =>
                          setCreatorFilter((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        className="bg-slate-50 w-28 text-black rounded-md px-2 py-1 focus:outline-none"
                      >
                        {creatorOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleResetFilters}
                    className="w-full flex justify-center items-center gap-1 mt-2 bg-gray-700 text-white hover:bg-gray-600 py-1 rounded"
                  >
                    <RiResetLeftLine />
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-100" />

            <div className="relative">
              <input
                type="text"
                placeholder="Search for an event"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-1 rounded-full bg-gray-800 text-light-200 border border-gray-500 focus:outline-none"
              />
              <div className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                <LiaSearchSolid />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
          <div className="w-[25%] overflow-y-auto bg-gray-800 border-r border-dark-100">
            {currentGroups.map((g) => (
              <div
                key={g.id}
                className={`flex justify-between items-center px-4 py-3 border-b border-dark-100 hover:bg-gray-700 cursor-pointer ${
                  viewedGroup?.id === g.id ? "bg-gray-700" : ""
                }`}
                onClick={() => {
                  setVieweGroup(g);
                  setViewedEvent(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <RiUserCommunityLine />
                  <p className="truncate">{g.name}</p>
                </div>
                {isFetchingEvents && viewedGroup?.id === g.id && (
                  <Loader size={16} />
                )}
              </div>
            ))}
          </div>

          {viewedGroup && (
            <div className="w-[25%] overflow-y-auto border-r border-dark-100">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`flex items-center gap-2 px-4 py-3 border-b border-dark-100 hover:bg-gray-700 cursor-pointer ${
                      viewedEvent?.id === e.id ? "bg-gray-700" : ""
                    }`}
                    onClick={() => setViewedEvent(e)}
                  >
                    <LuActivity />
                    <p className="truncate">{e.title}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-300 mt-4 px-4">
                  No events scheduled.
                </p>
              )}
            </div>
          )}

          {viewedGroup && viewedEvent && (
            <div className="w-[50%] overflow-y-auto p-6">
              <form
                ref={formRef}
                onSubmit={handleEditEvent}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  {isEditing ? (
                    <input
                      name="title"
                      defaultValue={viewedEvent.title}
                      className="text-2xl font-bold text-purple-400 focus:outline-none border-b-2 border-cyan-200"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-purple-400">
                      {viewedEvent.title}
                    </h2>
                  )}

                  <div className="flex gap-3">
                    {viewedEvent.eventCreatorUsername === user.username &&
                      (isEditing ? (
                        <>
                          <label className="flex items-center gap-1 text-sm text-light-200">
                            <input
                              type="checkbox"
                              name="notifyChanges"
                              onChange={() => setnotifyChanges((prev) => !prev)}
                            />
                            Notify Changes
                          </label>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="relative group p-1 text-fuchsia-300 hover:bg-fuchsia-300 hover:text-white rounded-md"
                          >
                            <MdCancel />
                          </button>
                          <button
                            type="submit"
                            className="relative group p-1 text-teal-500 hover:bg-teal-500 hover:text-white rounded-md"
                          >
                            <MdSave />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="relative group p-1 text-teal-500 hover:bg-teal-500 hover:text-white rounded-md"
                          >
                            <MdEdit />
                          </button>
                        </>
                      ))}

                    <button
                      type="button"
                      onClick={() => setDeleteMenuOpen((o) => !o)}
                      className="relative group p-1 text-red-500 hover:bg-red-500 hover:text-white rounded-md"
                    >
                      <MdDelete />
                    </button>
                    {deleteMenuOpen && (
                      <div className="bg-black/40 backdrop-blur-sm z-50 fixed inset-0 grid place-items-center overflow-y-auto py-8">
                        <div
                          ref={deleteMenuRef}
                          className="relative z-50 w-full max-w-screen border shadow-md dark:shadow-sm sm:rounded-lg md:w-full bg-dash-sidebar sm:align-middle sm:w-full sm:max-w-sm p-0 gap-0 pb-5 !block"
                        >
                          <div className="flex flex-col gap-1.5 text-center sm:text-left py-4 px-4 md:px-5 border-b">
                            <h2 className="text-base leading-none font-normal">
                              <span className="break-words">
                                Confirm deletion of event "{viewedEvent.title}"
                              </span>
                            </h2>
                          </div>
                          <div className="py-4 px-4 md:px-5 overflow-hidden">
                            <div className="space-y-4">
                              <p className="text-sm text-foreground-light text-start">
                                Are you sure you want to delete the selected
                                event? This action cannot be undone.
                              </p>
                              <div className="flex cursor-pointer leading-none">
                                <input
                                  id="notifyDeletion"
                                  name="notifyDeletion"
                                  type="checkbox"
                                  className=" bg-transparent outline-none text-brand border-strong shadow-sm rounded cursor-pointer  h-4 w-4 mt-0.5 mr-3.5"
                                  value={notifyDeletion}
                                  onChange={() =>
                                    setNotifyDeletion((prev) => !prev)
                                  }
                                />
                                <label
                                  htmlFor="notifyDeletion"
                                  className="text-light-100 cursor-pointer text-sm flex flex-col items-start justify-start"
                                >
                                  <span className="text-start">
                                    Notify Deletion?
                                  </span>
                                  <p className="text-light-200 text-sm text-start">
                                    Notify other members in the group about the
                                    deletion of the event
                                  </p>
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="w-full h-px bg-border"></div>
                          <div className="flex gap-2 px-5 pt-5">
                            <button
                              onClick={() => setDeleteMenuOpen(false)}
                              type="button"
                              className="relative cursor-pointer space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-foreground bg-alternative dark:bg-neutral-700 hover:bg-neutral-600 hover:bg-selection border-strong hover:border-stronger focus-visible:outline-brand-600 data-[state=open]:bg-selection data-[state=open]:outline-brand-600 data-[state=open]:border-button-hover w-full flex items-center justify-center text-sm px-4 py-2 h-[38px]"
                            >
                              <span className="truncate">Cancel</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteEvent(e)}
                              type="button"
                              className="relative cursor-pointer space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-foreground bg-[#541c15] hover:bg-[#e54d2e80] dark:hover:bg-destructive/50 border-destructive-500 hover:border-destructive hover:text-hi-contrast focus-visible:outline-amber-700 data-[state=open]:border-destructive data-[state=open]:bg-destructive-400 dark:data-[state=open]:bg-destructive-/50 data-[state=open]:outline-destructive w-full flex items-center justify-center text-sm px-4 py-2 h-[38px] truncate"
                            >
                              <span className="truncate">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    <span className="font-semibold text-light-200">
                      Created by:
                    </span>{" "}
                    {viewedEvent.eventCreatorUsername}
                  </p>
                  {isEditing ? (
                    <div className="flex gap-2 mb-4 w-full">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-light-200 mb-1">
                          Starts (Optional)
                        </label>
                        <input
                          autoComplete="off"
                          type="datetime-local"
                          name="startDate"
                          min={today}
                          defaultValue={viewedEvent.startDate}
                          className="w-51 p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-light-200 mb-1">
                          Ends (Optional)
                        </label>
                        <input
                          autoComplete="off"
                          type="datetime-local"
                          name="endDate"
                          min={viewedEvent.startDate}
                          defaultValue={viewedEvent.endDate}
                          className="w-51 p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p>
                        <span className="font-semibold text-light-200">
                          Starts:
                        </span>{" "}
                        {viewedEvent.startDate
                          ? formatTimestamp(viewedEvent.startDate)
                          : "N/A"}{" "}
                      </p>
                      <p>
                        <span className="font-semibold text-light-200">
                          Ends:
                        </span>{" "}
                        {viewedEvent.endDate
                          ? formatTimestamp(viewedEvent.endDate)
                          : "N/A"}
                      </p>
                    </div>
                  )}
                </div>

                <hr className="border-dark-100" />

                <div className="text-md flex items-center gap-2 text-light-100">
                  <span className="font-semibold text-light-200">
                    Event Link:
                  </span>{" "}
                  {viewedEvent.eventLink ? (
                    isEditing ? (
                      <input
                        name="eventLink"
                        className="focus:outline-none border-b-2 border-cyan-200"
                        defaultValue={viewedEvent.eventLink}
                      />
                    ) : (
                      <a
                        href={viewedEvent.eventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 underline hover:text-blue-300"
                      >
                        {viewedEvent.eventLink}
                        <GoLinkExternal />
                      </a>
                    )
                  ) : (
                    <span className="text-gray-400">No link provided</span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
