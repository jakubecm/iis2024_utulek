import React, { useEffect, useState } from 'react';
import { Slot } from './WalkReservations';
import { Cat } from '../types';
import { Button, Card, CardBody, CardFooter, Typography } from '@material-tailwind/react';
import { format, parseISO } from 'date-fns';
import { API_URL } from '../App';
import { useAuth } from '../auth/AuthContext';

interface InspectReservationProps {
  onReservationEdited: () => void;
  cat: Cat;
  slot: Slot;
}

const InspectReservation: React.FC<InspectReservationProps> = ({ onReservationEdited, slot, cat }) => {
  const [catPhoto, setCatPhoto] = useState<string>("");
  const { userId } = useAuth();
  const [isDefaultImageAvailable, setIsDefaultImageAvailable] = useState(true);

  const handleReserve = async () => {
    try {
      const requestBody = {
        SlotId: slot.id,
        VolunteerId: userId, // Replace with actual volunteer ID if needed
        RequestDate: format(new Date(), "yyyy-MM-dd"), // Current date and time
      };

      console.log("Sending reservation request:", requestBody);

      const response = await fetch(`${API_URL}/reservationrequests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Response:", errorData);
        throw new Error(errorData?.msg || "Failed to create reservation request");
      }

      console.log("Reservation request created successfully");
      onReservationEdited(); // Notify parent of the new reservation
    } catch (err) {
      console.error("Error creating reservation request:", err);
      alert(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const defaultImageAvailable = async () => {
    try {
      const response = await fetch(`${API_URL}/catphotos/default-image.png`, { method: "HEAD" });
      if (!response.ok) setIsDefaultImageAvailable(false);
    } catch {
      setIsDefaultImageAvailable(false);
    }
  };

  // fetch cat photo
  const fetchCatPhoto = async () => {
    try {
      const response = await fetch(`${API_URL}/cat/photo/retrieve/${cat.id}`, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json"
        },
      });
      const data = await response.json();
      console.log('data:', data);
      const imageUrl =
        data.length > 0
          ? `${API_URL}/${data[0].photo_url.replace("./", "")}`
          : isDefaultImageAvailable
          ? `${API_URL}/catphotos/default-image.png`
          : "";
      console.log('image url:', imageUrl);
      setCatPhoto(imageUrl);
      console.log('cat photo:', data);
    } catch (err) {
      console.error("Failed to fetch cat photo");
    }
  }

  useEffect(() => {
    defaultImageAvailable();
  }, []);

  useEffect(() => {
    if (isDefaultImageAvailable !== null) {
      fetchCatPhoto();
    }
  }, [isDefaultImageAvailable]);

  return (
    <Card className="mx-auto w-full !max-w-[40rem] !min-w-[40rem] px-2">
      <CardBody className="flex flex-col gap-4">
        <Typography variant="h5" color="blue-gray" className="mb-4 text-center font-semibold">
          Reservation Details
        </Typography>

        {/* Cat Information */}
        <div className='flex row justify-between'>
          <div>
            <div className="mb-4 max-w-[20rem]">
              <Typography variant="h6" color="blue-gray" className="font-bold">
                Cat Information
              </Typography>
              <Typography color="blue-gray" className="mb-2">
                <strong>Name:</strong> {cat.name}
              </Typography>
              <Typography color="blue-gray" className="mb-2">
                <strong>Age:</strong> {cat.age} years
              </Typography>
              <Typography color="blue-gray" className="mb-2">
                <strong>Description:</strong> {cat.description}
              </Typography>
              <Typography color="blue-gray" className="mb-2">
                <strong>Found:</strong> {cat.found}
              </Typography>
            </div>

            {/* Slot Information */}
            <div className="mb-4">
              <Typography variant="h6" color="blue-gray" className="font-bold">
                Slot Information
              </Typography>
              <Typography color="blue-gray" className="mb-2">
                <strong>Start Time:</strong> {format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm")}
              </Typography>
              <Typography color="blue-gray" className="mb-2">
                <strong>End Time:</strong> {format(parseISO(slot.end_time), "yyyy-MM-dd HH:mm")}
              </Typography>
            </div>
          </div>
          <div>
            {catPhoto ? (
              <img
                src={catPhoto}
                alt={cat.name}
                className="h-64 w-full object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none"; // Hide broken image
                }}
              />
            ) : (
              <Typography color="gray" className="text-center py-10">
                No image available
              </Typography>
            )}
          </div>
        </div>
      </CardBody>

      {/* Reserve Button */}
      <CardFooter className="flex justify-center">
        <Button color="green" onClick={handleReserve}>
          Make reservation
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InspectReservation;