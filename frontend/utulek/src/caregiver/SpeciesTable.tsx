import React from 'react';
import { Button, Card, Typography } from '@material-tailwind/react';

interface Species {
    id: number;
    name: string;
}

interface SpeciesTableProps {
    speciesList: Species[];
    onEdit: (species: Species) => void;
}

const SpeciesTable: React.FC<SpeciesTableProps> = ({ speciesList, onEdit }) => {
    return (
        <Card className="h-full w-full overflow-scroll">
        <table className="w-full min-w-max table-auto text-left">
            <thead>
            <tr>
                <th style={{ width: '50px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                    ID
                </Typography>
                </th>
                <th style={{ width: '150px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                    Name
                </Typography>
                </th>
                <th style={{ width: '100px' }} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"></th>
            </tr>
            </thead>
            <tbody>
            {speciesList.map((species) => (
                <tr key={species.id}>
                <td style={{ width: '50px' }} className="p-4 border-b border-blue-gray-50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                    {species.id}
                    </Typography>
                </td>
                <td style={{ width: '150px' }} className="p-4 border-b border-blue-gray-50 bg-blue-gray-50/50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                    {species.name}
                    </Typography>
                </td>
                <td style={{ width: '100px' }} className="p-4 border-b border-blue-gray-50">
                    <Button color="blue" onClick={() => onEdit(species)}>
                    Edit
                    </Button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </Card>
    );
};

export default SpeciesTable;
