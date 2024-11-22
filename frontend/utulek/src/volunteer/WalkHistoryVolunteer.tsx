import React, { useEffect } from 'react';
import WalkHistoryTable, { Request } from '../caregiver/WalkHistoryTable';
import { API_URL } from '../App';
import { useAuth } from '../auth/AuthContext';
import { Status } from '../types';
import { Typography } from '@material-tailwind/react';

const WalkHistoryVolunteer: React.FC = () => {
    const [walks, setWalks] = React.useState<Request[]>([]);
    const { userId } = useAuth();

    const fetchWalks = async () => {
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
          setWalks(data);
        } catch (err) {
          console.error("Failed to fetch requests");
        }
    };

    const updateRequestState = async (r: Request, status: Status) => {
        // volunteer should only be able to cancel their requests
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

        } catch (error) {
            console.error("Error approving reservation request:", error);
        } finally {
            fetchWalks();
        }
    };

    useEffect(() => {
        fetchWalks();
    }, [userId]);

    return (
        <>
        <Typography color="gray" type='h3'>Walk History</Typography>
        <WalkHistoryTable isCaregiver={false} walks={walks} updateRequestState={updateRequestState}/>
        </>
    );
};

export default WalkHistoryVolunteer;