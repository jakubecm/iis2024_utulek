import React from "react";
import { Button, Card, Typography } from "@material-tailwind/react";
import { useAuth } from "../auth/AuthContext";
import { Role } from "../auth/jwt";
import { ExaminationRequest } from "../types";

interface ExaminationRequestsTableProps {
    requests: ExaminationRequest[];
    onEdit: (request: ExaminationRequest) => void; // Callback for editing a request
}

const ExaminationRequestsTable: React.FC<ExaminationRequestsTableProps> = ({ requests, onEdit }) => {
    const { role } = useAuth(); // Get the user's role

    return (
        <Card className="h-full w-full overflow-scroll">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                    <tr>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Cat Name
                        </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Caregiver Name
                        </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Request Date
                        </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Description
                        </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Status
                        </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id}>
                        <td className="p-4 border-b border-blue-gray-50">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {req.cat_name || "N/A"}
                            </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {req.caregiver_name || "N/A"}
                            </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {req.request_date || "N/A"}
                            </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {req.description || "No description"}
                            </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {req.status === 0 ? "Pending" : req.status === 1 ? "Approved" : 
                                req.status === 2 ? "Rejected" : req.status === 3 ? "Scheduled" : 
                                req.status === 4 ? "Completed" : "Unknown"}
                            </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                            {(role === Role.ADMIN || role === Role.VETS || (role === Role.CAREGIVER && req.status === 0)) && (
                                <Button color="blue" onClick={() => onEdit(req)}>
                                    Edit
                                </Button>
                            )}
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

export default ExaminationRequestsTable;
