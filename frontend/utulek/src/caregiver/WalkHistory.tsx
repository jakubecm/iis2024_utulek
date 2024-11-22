import React, { useEffect, useState } from 'react';
import { ReservationRequest } from './ReservationRequests';
import { API_URL } from '../App';
import { Status } from '../types';
import WalkHistoryTable, { Request } from './WalkHistoryTable';
import { Typography } from '@material-tailwind/react';

const WalkHistory: React.FC = () => {
    const [ongoingRequestList, setOngoingRequestList] = useState<Request[]>([]);
    const [requestList, setRequestList] = useState<Request[]>([]);

    const fetchRequests = async (route: string) => {
        try {
            const response = await fetch(`${API_URL}/reservationrequests/overview/${route}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reservation requests');
            }

            const data = await response.json();
            if (route == 'sorted') setRequestList(data);
            else setOngoingRequestList(data);
        } catch (err) {
            console.error(err);
            // setError(err.message);
        } finally {
            console.log('p:');
            // setLoading(false);
        }
    }

    const updateRequestState = async (r: Request, status: Status) => {
        try {
            const response = await fetch(`${API_URL}/reservationrequests/${r.reservation_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Include cookies for authentication
                body: JSON.stringify({ Status: status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Failed to update reservation request");
            }

            console.log("Reservation request updated successfully");
            // Optionally handle successful status update (e.g., refresh table or notify user)
        } catch (error) {
            console.error("Error approving reservation request:", error);
        } finally {
            fetchRequests('sorted');
            fetchRequests('ongoing');
        }
    };

    const deleteRequest = async (r: Request) => {
        try {
            const response = await fetch(`${API_URL}/reservationrequests/${r.reservation_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Include cookies for authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Failed to delete reservation request");
            }

            if (Number(r.reservation_status) == Status.COMPLETED) {
                handleSlotDelete(r);
            }

            console.log("Reservation request deleted successfully");
            // Optionally handle successful status update (e.g., refresh table or notify user)
        } catch (error) {
            console.error("Error deleting reservation request:", error);
        } finally {
            fetchRequests('sorted');
            fetchRequests('ongoing');
        }
    };

    const handleSlotDelete = async (r: Request) => {
        const response = await fetch(`${API_URL}/availableslots/${r.slot_id}`, {
            method: "DELETE",
            credentials: "include",  // Include cookies for authentication
        });
  
        console.log(response);
    }

    useEffect(() => {
        fetchRequests('sorted');
        fetchRequests('ongoing');
    }, []);

    return (
        <>
            <Typography color="gray" variant='h3' >Current Walks</Typography>
            <WalkHistoryTable walks={ongoingRequestList} updateRequestState={updateRequestState} deleteRequest={deleteRequest} />

            <Typography color="gray" variant='h3' className='mt-8'>Walk History</Typography>
            <WalkHistoryTable walks={requestList} updateRequestState={updateRequestState} deleteRequest={deleteRequest} />
        </>

    );
};

export default WalkHistory;
