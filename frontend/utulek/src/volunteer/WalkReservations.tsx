import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Option } from '@material-tailwind/react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  CalendarEvent,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';

import '@schedule-x/theme-default/dist/index.css';
import { API_URL } from '../App';
import { Cat, Status } from '../types';
import InspectReservation from './InspectReservation';
import AsyncSelect from '../components/AsyncSelect';
import { useAuth } from '../auth/AuthContext';
import { Request } from '../caregiver/WalkHistoryTable';

export interface Slot {
  id: number;
  cat_id: number;
  start_time: string; // ISO 8601 date string
  end_time: string;   // ISO 8601 date string
}

const WalkReservations: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot>();
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [selectedCalendarCat, setSelectedCalendarCat] = useState<Cat>();
  const [catList, setCatList] = useState<Cat[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const { userId } = useAuth();

  // Ref to always hold the latest value of slots
  const slotsRef = useRef<Slot[]>([]);
  const requestsRef = useRef<Request[]>([]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reservationrequests/overview?user_id=${userId}`, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      console.log('data:', data);
      setRequests(data);
      requestsRef.current = data; // Update the ref with the fetched requests
    } catch (err) {
      setError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/availableslots`, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (!response.ok) throw new Error("Failed to fetch slots");
      const data = await response.json();
      console.log('data:', data);
      setSlots(data);
      slotsRef.current = data; // Update the ref with the fetched slots
    } catch (err) {
      setError("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  const fetchCats = () => {
    fetch(`${API_URL}/cats`)
      .then((response) => response.json())
      .then((data) => {
        data.unshift({ id: "", name: "All Cats" });
        setCatList(data);
      })
      .catch((error) => console.error("Error fetching cats:", error));
  };

  useEffect(() => {
    fetchSlots();
    fetchRequests();
    fetchCats();
  }, []);

  // Update events whenever slots are fetched
  useEffect(() => {
    if (!loading && slots.length > 0) {
      const filteredSlots = selectedCat
        ? slots.filter((slot) => slot.cat_id === selectedCat.id)
        : slots;

      const openEvents = filteredSlots.map((slot) => {
        const cat = catList.find((cat) => cat.id === slot.cat_id);
        return ({
          id: slot.id.toString(),
          title: cat?.name || "",
          start: slot.start_time,
          end: slot.end_time,
          cat: cat,
          slot: slot,
          calendarId: '',
        });
      });

      // show events that are already registered
      // criteria: slot is not available and it is in progress or approved
      const registeredEvents = requests.map((req) => {
        const slot = slots.find((s) => s.id === req.slot_id);
        const cat = catList.find((c) => c.id === req.cat_id && (c.id === selectedCat?.id || !selectedCat));
        if (slot || !cat || (Number(req.reservation_status) != Status.PENDING && Number(req.reservation_status) != Status.APPROVED)) return;
        const color_profile = Number(req.reservation_status) == Status.PENDING ? 'pending' : Number(req.reservation_status) == Status.APPROVED ? 'approved' : '';
        return ({
          id: req.slot_id.toString(),
          title: cat?.name || "",
          start: req.start_time,
          end: req.end_time,
          cat: cat,
          slot: null,
          calendarId: color_profile,
        });
      }).filter((event) => event !== undefined);;
      console.log('openEvents:', openEvents);
        console.log('registeredEvents:', registeredEvents);

      const mappedEvents = [...openEvents, ...registeredEvents];
      console.log('mappedEvents:', mappedEvents);
      setEvents(mappedEvents);
    }
  }, [slots, loading, catList, selectedCat]);

  console.log('events:', events);

  const plugins = [createEventsServicePlugin()];

  const calendar = useCalendarApp(
    {
      views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
      events: events, // Use dynamic events here
      dayBoundaries: {
        start: '07:00',
        end: '17:00',
      },
      callbacks: {
        onEventClick: (calendarEvent: CalendarEvent) => {
          console.log('Event clicked:', calendarEvent);
          // Use slotsRef to access the latest slots
          setSelectedSlot(calendarEvent.slot);
          setSelectedCalendarCat(calendarEvent.cat);
          setIsEditOpen(true);
        },
      },
      calendars: {
        pending: {
          colorName: 'pending',
          lightColors: {
            main: '#ff4747',
            container: '#ff5757',
            onContainer: '#590009',
          },
        },
        approved: {
          colorName: 'approved',
          lightColors: {
            main: '#47ff47', // Vibrant green
            container: '#57ff57', // Slightly lighter green
            onContainer: '#005900', // Dark green for contrast
          },
        },
      },
    },
    plugins
  );

  // Ensure the calendar plugin re-fetches and re-renders events
  useEffect(() => {
    calendar.eventsService.set(events);
  }, [calendar, events]);

  const closeEditModal = () => setIsEditOpen(!isEditOpen);
  const handleSlotEdited = () => {
    setIsEditOpen(false);
    fetchSlots();
    fetchRequests();
  };

  const handleCatChange = (selectedId?: string) => {
    if (!selectedId) {
      setSelectedCat(null); // Show all cats
    } else {
      const cat = catList.find((c) => c.id.toString() === selectedId);
      setSelectedCat(cat || null);
    }
  };

  return (
    <div>
      <h1>Reservation Requests</h1>
      <div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error &&
          <>
            <div className='mt-5 mb-5'>
              <AsyncSelect
                label="Select a specific cat"
                value={selectedCat?.id.toString() || ""}
                onChange={handleCatChange}
                size="lg"
              >
                {catList.map((cat) => (
                  <Option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </Option>
                ))}
              </AsyncSelect>
            </div>
            <ScheduleXCalendar calendarApp={calendar} />
          </>
        }
      </div>
      {selectedSlot && selectedCalendarCat && (
        <Dialog open={isEditOpen} handler={closeEditModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
          <InspectReservation onReservationEdited={handleSlotEdited} slot={selectedSlot} cat={selectedCalendarCat} />
        </Dialog>
      )}
    </div>
  );
};

export default WalkReservations;
