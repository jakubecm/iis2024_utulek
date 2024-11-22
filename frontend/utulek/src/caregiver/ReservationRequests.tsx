import React, { useEffect, useState, useRef } from 'react';
import { Button, Card, CardBody, CardFooter, Dialog, Option } from '@material-tailwind/react';
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
import AddReservationSlot from './AddReservationSlot';
import EditReservationSlot from './EditReservationSlot';
import { Cat, Status } from '../types';
import RequestTable from './RequestTable';
import AsyncSelect from '../components/AsyncSelect';

export interface Slot {
  id: number;
  cat_id: number;
  start_time: string; // ISO 8601 date string
  end_time: string;   // ISO 8601 date string
}

export interface ReservationRequest {
  id: number;
  slot_id: number;
  volunteer_id: string;
  request_date: string;
  status: number;
}

const ReservationRequests: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot>();
  const [catList, setCatList] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reservationrequests`, {
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

  // Ref to always hold the latest value of slots
  const slotsRef = useRef<Slot[]>([]);
  const requestsRef = useRef<ReservationRequest[]>([]);


  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/availableslots?all=true`, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (!response.ok) throw new Error("Failed to fetch slots");
      const data = await response.json();
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
    fetchCats();
    fetchRequests();
  }, []);

  // Update events whenever slots are fetched
  useEffect(() => {
    if (!loading && slots.length > 0) {
      const filteredSlots = selectedCat
        ? slots.filter((slot) => slot.cat_id === selectedCat.id)
        : slots;

      const mappedEvents = filteredSlots.map((slot) => {
        const cat = catList.find((cat) => cat.id === slot.cat_id);
        const request = requests.find((req) => req.slot_id === slot.id && req.status != Status.REJECTED && req.status != Status.CANCELED);
        console.log('request:', request);

        const past = new Date(slot.end_time) < new Date();
        const color_profile = request && (request.status == Status.PENDING ? 'pending' : request.status == Status.APPROVED ? 'approved' : past ? 'old' : '');
        console.log('color_profile:', color_profile);
        return {
          id: slot.id.toString(),
          title: cat?.name || "",
          start: slot.start_time,
          end: slot.end_time,
          calendarId: color_profile,
        }
      });
      setEvents(mappedEvents);
    }
  }, [slots, loading, selectedCat, requests]);

  const handleCatChange = (selectedId?: string) => {
    if (!selectedId) {
      setSelectedCat(null); // Show all cats
    } else {
      const cat = catList.find((c) => c.id.toString() === selectedId);
      setSelectedCat(cat || null);
    }
  };

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
          const slot = slotsRef.current.find((s) => s.id === Number(calendarEvent.id));
          const request = requestsRef.current.find((req) => slot && req.slot_id === slot.id && req.status != Status.REJECTED && req.status != Status.CANCELED);

          // forbid editing reserved slots
          if (!request && slot && new Date(slot.end_time) > new Date()) {
            setSelectedSlot(slot);
            setIsEditOpen(true);
          }
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
        old: {
          colorName: 'old',
          lightColors: {
            main: '#b0b0b0', // Neutral medium gray
            container: '#d6d6d6', // Light gray for the container
            onContainer: '#3a3a3a', // Dark gray for contrast
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

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const closeEditModal = () => setIsEditOpen(!isEditOpen);
  const handleSlotAdded = () => {
    setIsModalOpen(false);
    fetchSlots();
  };
  const handleSlotEdited = () => {
    setIsEditOpen(false);
    fetchSlots();
  };

  return (
    <div>
      <h1>ReservationRequests</h1>
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
      <Button color="blue" onClick={toggleModal} className="mt-8">
        Add Reservation Slot
      </Button>
      <Dialog open={isModalOpen} handler={toggleModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
        <Card className="mx-auto w-full !max-w-[30rem] !min-w-[30rem] px-2">
          <CardBody className="flex flex-col gap-4">
            <AddReservationSlot onReservationAdded={handleSlotAdded} catList={catList} />
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="text" color="red" onClick={toggleModal} className="mr-2">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
      {selectedSlot && (
        <Dialog open={isEditOpen} handler={closeEditModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
          <Card className="mx-auto w-full !max-w-[30rem] !min-w-[30rem] px-2">
            <CardBody className="flex flex-col gap-4">
              <EditReservationSlot onReservationEdited={handleSlotEdited} slot={selectedSlot} catList={catList} />
            </CardBody>
            <CardFooter className="pt-0">
              <Button variant="text" color="red" onClick={closeEditModal} className="mr-2">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </Dialog>
      )}
      <RequestTable onApprove={() => fetchSlots()}/>
    </div>
  );
};

export default ReservationRequests;