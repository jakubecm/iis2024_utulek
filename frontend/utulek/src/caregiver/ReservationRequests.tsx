import { Button, Card, CardBody, CardFooter, Dialog } from '@material-tailwind/react';
import React, { useState } from 'react';
import AddReservationSlot from './AddReservationSlot';

const ReservationRequests: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => setIsModalOpen(!isModalOpen);
    const handleUserAdded = () => {
        setIsModalOpen(false);
        //fetchUsers();
    };
    return (
        <div>
            <h1>ReservationRequests</h1>
            <Button color="blue" onClick={toggleModal} className="mt-8">
                Add Reservation Slot
            </Button>
            <Dialog open={isModalOpen} handler={toggleModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
                <Card className="mx-auto w-full !max-w-[30rem] !min-w-[30rem] px-2">
                    <CardBody className="flex flex-col gap-4">
                        <AddReservationSlot onReservationAdded={handleUserAdded} />
                    </CardBody>
                    <CardFooter className="pt-0">
                        <Button variant="text" color="red" onClick={toggleModal} className="mr-2">
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </Dialog>
        </div>
    );
};

export default ReservationRequests;