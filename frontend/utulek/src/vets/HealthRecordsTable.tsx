import React from 'react';
import { Card, Typography } from '@material-tailwind/react';
import { HealthRecord } from '../types';

interface HealthRecordsTableProps {
  healthRecords: HealthRecord[];
  onAdd: () => void; // Function to open the form for adding a new health record
}

const HealthRecordsTable: React.FC<HealthRecordsTableProps> = ({
  healthRecords,
}) => {
  return (
    <Card className="h-full w-full overflow-scroll">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            <th style={{ width: '150px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                Date
              </Typography>
            </th>
            <th style={{ width: '400px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                Description
              </Typography>
            </th>
            <th style={{ width: '200px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                Veterinarian
              </Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {healthRecords.map((record) => (
            <tr key={record.id}>
              <td className="p-4 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  {record.date || "N/A"}
                </Typography>
              </td>
              <td className="p-4 border-b border-blue-gray-50 bg-blue-gray-50/50">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  {record.description || "No description"}
                </Typography>
              </td>
              <td className="p-4 border-b border-blue-gray-50">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  {record.vet_name || "Unknown"}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default HealthRecordsTable;
