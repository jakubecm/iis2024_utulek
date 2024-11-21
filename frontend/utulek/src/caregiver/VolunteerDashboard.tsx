import React, { useEffect, useState } from 'react';
import { API_URL } from '../App';
import { Role } from '../auth/jwt';
import VolunteerTable from './VolunteerTable';

const VolunteerDashboard: React.FC = () => {
    const [volunteerList, setVolunteerList] = useState([]);

    const fetchVolunteers = async () => {
        try {
            const response = await fetch(`${API_URL}/caregiver/unverified_volunteers`, { 
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch volunteers');
            }

            const data = await response.json();
            setVolunteerList(data);

        } catch (error) {
            console.error("Error fetching species:", error);
        }
    };

    const handleValidate = async (volunteer) => {

        // Prepare updated user data
        const userData = {
            ...volunteer,
            verified: true,
            role: Role.VERIFIED_VOLUNTEER,
        };

        console.log(userData);

        await fetch(`${API_URL}/admin/users/${volunteer.Id}`, {
            method: "PUT",
            credentials: "include",  // Include cookies for authentication
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        fetchVolunteers(); // Update the volunteer list
    };

    
    useEffect(() => { fetchVolunteers(); }, []);

    return (
        <div>
        <h1 className="font-bold leading-snug tracking-tight text-slate-800 my-6 w-full text-2xl lg:max-w-3xl lg:text-5xl">
            Volunteer Verification
        </h1>
        <VolunteerTable volunteerList={volunteerList} validateVolunteer={handleValidate} />

        </div>
    );
};

export default VolunteerDashboard;
