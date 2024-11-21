import React, { useEffect, useState } from 'react';
import { Slot } from './WalkReservations';
import { Cat } from '../types';
import { Button, Card, CardBody, CardFooter, Typography } from '@material-tailwind/react';
import { format, parseISO } from 'date-fns';
import { API_URL } from '../App';

interface InspectReservationProps {
  onReservationEdited: () => void;
  cat: Cat;
  slot: Slot;
}

const InspectReservation: React.FC<InspectReservationProps> = ({ onReservationEdited, slot, cat }) => {
  const [catPhoto, setCatPhoto] = useState<string>("");

  const handleReserve = () => {
    console.log("Reserve button clicked! Future functionality here.");
    // Placeholder for reserve functionality
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
      if (!response.ok) throw new Error("Failed to fetch cat photo");
      const data = await response.json();
      console.log('data:', data);
      const imageUrl = data.length > 0
        ? `${API_URL}/${(data[0].photo_url).replace("./", "")}`
        : `${API_URL}/catphotos/default-image.png`;
      console.log('image url:', imageUrl);
      setCatPhoto(imageUrl);
      console.log('cat photo:', data);
    } catch (err) {
      console.error("Failed to fetch cat photo");
    }
  }

  useEffect(() => {
    fetchCatPhoto();
  }, []);

  return (
    <Card className="mx-auto w-full !max-w-[35rem] !min-w-[32rem] px-2">
      <CardBody className="flex flex-col gap-4">
        <Typography variant="h5" color="blue-gray" className="mb-4 text-center font-semibold">
          Reservation Details
        </Typography>

        {/* Cat Information */}
        <div className='flex row space-x-5'>
          <div>
            <div className="mb-4">
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
            <img
              src={catPhoto}
              alt={cat.name}
              className="h-64 w-full object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.src = "/static/default-image.png";
              }}
            />
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