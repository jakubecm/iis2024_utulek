import React from 'react';
import { Slot } from './WalkReservations';
import { Cat } from '../types';
import { Button, Card, CardBody, CardFooter, Typography } from '@material-tailwind/react';
import { format, parseISO } from 'date-fns';

export interface Cat {
    id: number;
    name: string;
    age: number;
    description: string;
    found: string;
    photos: string[];
    species_id: number;
}

export interface Slot {
    id: number;
    cat_id: number;
    start_time: string; // ISO 8601 date string
    end_time: string;   // ISO 8601 date string
  }

interface InspectReservationProps {
    onReservationEdited: () => void;
    cat: Cat;
    slot: Slot;
}

const InspectReservation: React.FC<InspectReservationProps> = ({ onReservationEdited, slot, cat }) => {
    const handleReserve = () => {
        console.log("Reserve button clicked! Future functionality here.");
        // Placeholder for reserve functionality
      };
    
      return (
        <Card className="mx-auto w-full !max-w-[30rem] !min-w-[30rem] px-2">
            <CardBody className="flex flex-col gap-4">
            <Typography variant="h5" color="blue-gray" className="mb-4 text-center font-semibold">
              Reservation Details
            </Typography>
            
            {/* Cat Information */}
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
          </CardBody>
    
          {/* Reserve Button */}
          <CardFooter className="flex justify-center">
            <Button color="green" onClick={handleReserve}>
              Reserve
            </Button>
          </CardFooter>
        </Card>
      );
    };

export default InspectReservation;