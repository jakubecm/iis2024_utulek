import React, { useState } from "react";
import { Button, Input, Typography, Popover, PopoverContent, PopoverHandler, Option } from "@material-tailwind/react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { API_URL } from "../App";
import AsyncSelect from "../components/AsyncSelect";
import { Cat } from "../types";
import { Slot } from "./ReservationRequests";

interface EditReservationSlotProps {
    onReservationEdited: () => void;
    catList: Cat[];
    slot: Slot;
}

const EditReservationSlot: React.FC<EditReservationSlotProps> = ({ onReservationEdited, slot, catList }) => {
    const [catId, setCatId] = useState<number>(slot.cat_id);
    const [date, setDate] = useState<Date>(new Date(slot.start_time));
    const [startTime, setStartTime] = useState<string>(format(new Date(slot.start_time), "HH:mm")); // Extract time
    const [endTime, setEndTime] = useState<string>(format(new Date(slot.end_time), "HH:mm")); // Extract time
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    console.log(date);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            if (!date || !startTime || !endTime || !catId) {
                setError("All fields are required.");
                setLoading(false);
                return;
            }

            // Current date and time for comparison
            const now = new Date();
    
            // Format start and end times as datetime strings
            const startDateTime = new Date(`${format(date, "yyyy-MM-dd")}T${startTime}`);
            const endDateTime = new Date(`${format(date, "yyyy-MM-dd")}T${endTime}`);

                    // Validate that the date and time are not in the past
            if (startDateTime < now) {
                setError("Start time cannot be in the past.");
                setLoading(false);
                return;
            }

            // Validate that the start time is not later than the end time
            if (startDateTime >= endDateTime) {
                setError("Start time must be earlier than end time.");
                setLoading(false);
                return;
            }
    
            // Prepare the request body
            const requestBody = {
                cat_id: catId,
                start_time: `${format(date, "yyyy-MM-dd")} ${startTime}`,
                end_time: `${format(date, "yyyy-MM-dd")} ${endTime}`,
            };
    
            console.log("Request Body:", requestBody);
    
            // POST request to the endpoint
            const response = await fetch(`${API_URL}/availableslots/${slot.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error Response:", errorData);
                throw new Error(errorData?.msg || "Failed to add reservation slot");
            }
    
            onReservationEdited(); // Notify parent of the new slot
        } catch (err) {
            console.error(err);
            setError(String(err) || "Failed to add reservation slot");
        } finally {
            setLoading(false);
        }
    };
    

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartTime(e.target.value);
        if (date) {
        const formattedDate = format(date, "yyyy-MM-dd");
        console.log("Start time:", formattedDate);
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndTime(e.target.value);
    };

    const handleDelete = async () => {
      const response = await fetch(`${API_URL}/availableslots/${slot.id}`, {
          method: "DELETE",
          credentials: "include",  // Include cookies for authentication
      });

      onReservationEdited();  // Callback to remove user from the list
      console.log(response);
  }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
        <Typography variant="h4" color="blue-gray" className="text-center font-semibold">
            Editing a Reservation Slot
        </Typography>
        <AsyncSelect
          label="Cat"
          value={String(catId)}
          onChange={(idAsString) => setCatId(Number(idAsString))}
          size="lg"
        >
          {catList.map((cat) => (
            <Option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </Option>
          ))}
        </AsyncSelect>
        <Popover placement="bottom">
        <PopoverHandler>
          <Input
            label="Select a Date"
            onChange={() => null}
            value={date ? format(date, "PPP") : ""}
            required
          />
        </PopoverHandler>
        <PopoverContent className="z-[10000] min-w-[300px] max-w-[400px]">
        <DayPicker
            mode="single"
            selected={date}
            onSelect={setDate}
            required={true}
          />
        </PopoverContent>
      </Popover>
      <div className="flex row space-x-1.5">
        <Input
          type="time"
          label="Start Time"
          value={startTime}
          onChange={handleStartTimeChange}
          required
          size="md" // Add padding to accommodate the icon
        />
        <Input
          type="time"
          label="End Time"
          value={endTime}
          onChange={handleEndTimeChange}
          required
          size="md" // Add padding to accommodate the icon
        />
        </div>
        <div className="flex justify-end space-x-4">
                <Button type="button" color="red" onClick={handleDelete}>
                    Delete
                </Button>
                <Button type="submit" color="blue" fullWidth disabled={loading}>
                    {loading ? "Creating..." : "Update slot"}
                </Button>
            </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
    );
};

export default EditReservationSlot;