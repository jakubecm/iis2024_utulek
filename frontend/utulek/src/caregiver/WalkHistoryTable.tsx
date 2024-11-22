import React from 'react';
import { Button, Card, Typography } from '@material-tailwind/react';
import { Status } from '../types';

export interface Request {
    reservation_id: number;
    volunteer_username: number;
    volunteer_full_name: string;
    cat_name: string;
    cat_id: number;
    start_time: string;
    end_time: string;
    reservation_status: string;
    slot_id: number;
}

const StatusStr: { [key: number]: string } = {
    0: "Pending approval",
    1: "Approved",
    2: "Rejected",
    3: "Completed",
    4: "In Progress",
    5: "Canceled",
};

interface WalkHistoryTableProps {
    walks: Request[];
    updateRequestState: (r: Request, status: Status) => void;
    deleteRequest?: (r: Request) => void;
    isCaregiver?: boolean;
}

const WalkHistoryTable: React.FC<WalkHistoryTableProps> = ({ walks, updateRequestState, deleteRequest, isCaregiver = true }) => {
    return (
        <Card className="min-h-[10rem] w-full my-5">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                        <th style={{ width: '150px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Username
                            </Typography>
                        </th>
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
                        <th style={{ width: '100px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Status
                            </Typography>
                        </th>
                        <th style={{ width: '250px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {walks.map((r) => (
                        <tr key={r.reservation_id}>
                            <td style={{ width: '150px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {r.volunteer_username}
                                </Typography>
                            </td>
                            <td style={{ width: '200px' }} className="p-4 border-b border-blue-gray-50 bg-blue-gray-50/50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
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
                            <td style={{ width: '100px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {StatusStr[Number(r.reservation_status)]}
                                </Typography>
                            </td>
                            <td style={{ width: '250px' }} className="p-4 border-b border-blue-gray-50 justify-between flex row">
                            { isCaregiver && deleteRequest ? 
                                ( <>
                                    {   // If the request is approved, show the start / end button
                                        Number(r.reservation_status) == Status.APPROVED ?
                                            <Button color="green" onClick={() => updateRequestState(r, Status.IN_PROGRESS)}>
                                                Start
                                            </Button> : Number(r.reservation_status) == Status.IN_PROGRESS ?
                                            <Button color="green" onClick={() => updateRequestState(r, Status.COMPLETED)}>
                                                End
                                            </Button> : <></>
                                    }
                                    {   // If the request is not pending, show the delete / cancel buttons
                                        Number(r.reservation_status) != Status.PENDING ? (
                                            Number(r.reservation_status) == Status.COMPLETED || Number(r.reservation_status) == Status.REJECTED || Number(r.reservation_status) == Status.CANCELED ?
                                                <Button color="red" onClick={() => deleteRequest(r)}>
                                                    Delete
                                                </Button> : 
                                                <Button color="red" onClick={() => updateRequestState(r, Status.CANCELED)}>
                                                    Cancel
                                                </Button>
                                        // If the request is pending, show the approve / reject buttons
                                        ) : Number(r.reservation_status) == Status.PENDING ? (
                                            <>
                                                <Button color="green" onClick={() => updateRequestState(r, Status.APPROVED)}>
                                                    Approve
                                                </Button>
                                                <Button color="red" onClick={() => updateRequestState(r, Status.REJECTED)}>
                                                    Reject
                                                </Button>
                                            </> 
                                        ) : <></>
                                    } 
                                </> ) : (
                                    // If the user is not a caregiver, show the cancel button for pending / approved requests
                                    (Number(r.reservation_status) == Status.PENDING || Number(r.reservation_status) == Status.APPROVED) && 
                                        <Button color="red" onClick={() => updateRequestState(r, Status.CANCELED)}>
                                            Cancel
                                        </Button>
                                )
                            }

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

export default WalkHistoryTable;