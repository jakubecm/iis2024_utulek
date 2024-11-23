import React, { useMemo, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter } from '@material-tailwind/react';
import SpeciesTable from './SpeciesTable';
import AddSpeciesForm from './AddSpeciesForm';
import EditSpeciesForm from './EditSpeciesForm';
import { API_URL } from '../App';

interface Species {
    id: number;
    name: string;
}

const SpeciesDashboard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [speciesList, setSpeciesList] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

    const fetchSpecies = async () => {
        try {
            const response = await fetch(`${API_URL}/species`, { 
                method: 'GET' 
            });

            if (!response.ok) {
                throw new Error('Failed to fetch species');
            }

            const data = await response.json();
            setSpeciesList(data);

        } catch (error) {
            console.error("Error fetching species:", error);
        }
    };

    const toggleModal = () => setIsModalOpen(!isModalOpen);
    const handleSpeciesAdded = () => {
        setIsModalOpen(false);
        fetchSpecies();
    };

    const openEditModal = (species: Species) => {
        setSelectedSpecies(species);
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setSelectedSpecies(null);
        setIsEditOpen(false);
        fetchSpecies();
    };

    useMemo(() => { fetchSpecies(); }, []);

    return (
        <div>
        <h1 className="font-bold leading-snug tracking-tight text-slate-800 my-6 w-full text-2xl lg:max-w-3xl lg:text-5xl">
            Species Dashboard
        </h1>
        <SpeciesTable speciesList={speciesList} onEdit={openEditModal} />
        <Button color="blue" onClick={toggleModal} className="mt-8">
            Add New Species
        </Button>

        {/* Add Species modal */}
        <Dialog open={isModalOpen} handler={toggleModal} size="lg">
            <DialogBody>
            <AddSpeciesForm onSpeciesAdded={handleSpeciesAdded} />
            </DialogBody>
            <DialogFooter>
            <Button variant="text" color="red" onClick={toggleModal} className="mr-2">
                Cancel
            </Button>
            </DialogFooter>
        </Dialog>

        {/* Edit Species modal */}
        {selectedSpecies && (
            <Dialog open={isEditOpen} handler={closeEditModal} size="lg">
            <DialogBody>
                <EditSpeciesForm species={selectedSpecies} onModification={closeEditModal} />
            </DialogBody>
            <DialogFooter>
                <Button color="red" onClick={closeEditModal}>Cancel</Button>
            </DialogFooter>
            </Dialog>
        )}
        </div>
    );
};

export default SpeciesDashboard;
