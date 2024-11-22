import React, { useEffect, useState } from 'react';
import { Button, Card, Typography, Dialog, DialogBody, DialogFooter } from '@material-tailwind/react';
import { API_URL } from '../App';
import { Status } from '../types';

interface Request {
    reservation_id: number;
    volunteer_username: number;
    volunteer_full_name: string;
    volunteer_email: string;
    cat_name: string;
    start_time: string;
    end_time: string;
    reservation_status: string;
}

interface RequestTableProps {
    onApprove: () => void;
}

const RequestTable: React.FC<RequestTableProps> = () => {
    const [requestList, setRequestList] = useState<Request[]>([]);
    const [selectedUser, setSelectedUser] = useState<Request | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/reservationrequests/overview`, { 
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
            console.log('khaled:', data);
            setRequestList(data);
        } catch (err) {
            console.error(err);
            // setError(err.message);
        } finally {
            console.log('p:');
            // setLoading(false);
        }
    }

    const approveRequest = async (r: Request, status: Status) => {
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
            fetchRequests();
          }
    };

    const openUserModal = (user: Request) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <Card className="h-full w-full my-5">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                        <th style={{ width: '200px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Full Name
                            </Typography>
                        </th>
                        <th style={{ width: '100px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Cat
                            </Typography>
                        </th>
                        <th style={{ width: '150px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Start time
                            </Typography>
                        </th>
                        <th style={{ width: '150px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                End time
                            </Typography>
                        </th>
                        <th style={{ width: '250px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {requestList.map((r) => (
                        <tr key={r.reservation_id}>
                            <td style={{ width: '200px' }} className="p-4 border-b border-blue-gray-50 bg-blue-gray-50/50">
                                <Typography
                                    variant="small"
                                    color="blue"
                                    className="font-normal cursor-pointer underline"
                                    onClick={() => openUserModal(r)}
                                >
                                    {r.volunteer_full_name}
                                </Typography>
                            </td>
                            <td style={{ width: '100px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {r.cat_name}
                                </Typography>
                            </td>
                            <td style={{ width: '100px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {r.start_time}
                                </Typography>
                            </td>
                            <td style={{ width: '100px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {r.end_time}
                                </Typography>
                            </td>
                            <td style={{ width: '250px' }} className="p-4 border-b border-blue-gray-50 justify-between flex row">
                                <Button color="green" onClick={() => approveRequest(r, Status.APPROVED)}>
                                    Approve
                                </Button>
                                <Button color="red" onClick={() => approveRequest(r, Status.REJECTED)}>
                                    Reject
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* User Info Modal */}
            {selectedUser && (
                <Dialog open={isUserModalOpen} handler={() => setIsUserModalOpen(false)}>
                    <DialogBody>
                        <Typography variant="h2" color="blue-gray">
                            User Information
                        </Typography>
                        <Typography variant="h5" color="blue-gray">
                            <strong>Username:</strong> {selectedUser.volunteer_username}
                        </Typography>
                        <Typography variant="h5" color="blue-gray">
                            <strong>Full Name:</strong> {selectedUser.volunteer_full_name}
                        </Typography>
                        <Typography variant="h5" color="blue-gray">
                            <strong>Email:</strong> {selectedUser.volunteer_email}
                        </Typography>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="text" color="red" onClick={() => setIsUserModalOpen(false)} className="mr-2">
                            Close
                        </Button>
                    </DialogFooter>
                </Dialog>
            )}
        </Card>
    );
};

export default RequestTable;
