import React from 'react';
import { Button, Card, Typography } from '@material-tailwind/react';

interface Volunteer {
    Id: number;
    Username: string;
    FirstName: string;
    LastName: string;
    Email: string;
    role: number;
    verified: boolean;
}

interface VolunteerTableProps {
    volunteerList: Volunteer[];
    validateVolunteer: (volunteer: Volunteer) => void;
}

const VolunteerTable: React.FC<VolunteerTableProps> = ({ volunteerList, validateVolunteer }) => {
    return (
        <Card className="h-full w-full">
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
                        <th style={{ width: '250px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Email
                            </Typography>
                        </th>
                        <th style={{ width: '100px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Verified
                            </Typography>
                        </th>
                        <th style={{ width: '100px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {volunteerList.map((volunteer) => (
                        <tr key={volunteer.Id}>
                            <td style={{ width: '150px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {volunteer.Username}
                                </Typography>
                            </td>
                            <td style={{ width: '200px' }} className="p-4 border-b border-blue-gray-50 bg-blue-gray-50/50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {volunteer.FirstName} {volunteer.LastName}
                                </Typography>
                            </td>
                            <td style={{ width: '250px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {volunteer.Email}
                                </Typography>
                            </td>
                            <td style={{ width: '100px' }} className="p-4 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {volunteer.verified ? 'Yes' : 'No'}
                                </Typography>
                            </td>
                            <td style={{ width: '100px' }} className="p-4 border-b border-blue-gray-50">
                                <Button color="green" onClick={() => validateVolunteer(volunteer)}>
                                    Verify
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

export default VolunteerTable;
