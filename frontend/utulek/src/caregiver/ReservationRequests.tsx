import React, { useEffect, useState, useRef } from 'react';
import { Button, Card, CardBody, CardFooter, Dialog } from '@material-tailwind/react';
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

export interface Slot {
  id: number;
  cat_id: number;
  start_time: string; // ISO 8601 date string
  end_time: string;   // ISO 8601 date string
}

const ReservationRequests: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot>();

  // Ref to always hold the latest value of slots
  const slotsRef = useRef<Slot[]>([]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/availableslots`);
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

  useEffect(() => {
    fetchSlots();
  }, []);

  // Update events whenever slots are fetched
  useEffect(() => {
    if (!loading && slots.length > 0) {
      const mappedEvents = slots.map((slot) => ({
        id: slot.id.toString(),
        start: slot.start_time,
        end: slot.end_time,
      }));
      setEvents(mappedEvents);
    }
  }, [slots, loading]);

  console.log('events:', events);

  const plugins = [createEventsServicePlugin()];

  const calendar = useCalendarApp(
    {
      views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
      events: events, // Use dynamic events here
      dayBoundaries: {
        start: '06:00',
        end: '18:00',
      },
      callbacks: {
        onEventClick: (calendarEvent: CalendarEvent) => {
          console.log('Event clicked:', calendarEvent);
          // Use slotsRef to access the latest slots
          const slot = slotsRef.current.find((s) => s.id === Number(calendarEvent.id));
          console.log('Slots (from ref):', slotsRef.current);
          console.log('calendarEvent.id:', calendarEvent.id);
          console.log('Slot:', slot);
          setSelectedSlot(slot);
          setIsEditOpen(true);
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
        {!loading && !error && <ScheduleXCalendar calendarApp={calendar} />}
      </div>
      <Button color="blue" onClick={toggleModal} className="mt-8">
        Add Reservation Slot
      </Button>
      <Dialog open={isModalOpen} handler={toggleModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
        <Card className="mx-auto w-full !max-w-[30rem] !min-w-[30rem] px-2">
          <CardBody className="flex flex-col gap-4">
            <AddReservationSlot onReservationAdded={handleSlotAdded} />
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
              <EditReservationSlot onReservationEdited={handleSlotEdited} slot={selectedSlot} />
            </CardBody>
            <CardFooter>
              <Button variant="text" color="red" onClick={closeEditModal} className="mr-2">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </Dialog>
      )}
    </div>
  );
};

export default ReservationRequests;