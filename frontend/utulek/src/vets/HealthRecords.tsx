import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Select, Option, Typography, Dialog, DialogBody } from "@material-tailwind/react";
import { API_URL } from "../App";
import HealthRecordsTable from "./HealthRecordsTable";
import AddHealthRecordForm from "./AddHealthRecordForm";
import EditHealthRecordForm from "./EditHealthRecordForm";
import { HealthRecord } from "../types";

interface Cat {
    id: number;
    name: string;
}

const HealthRecordsTab: React.FC = () => {
    const [cats, setCats] = useState<Cat[]>([]);
    const [selectedCat, setSelectedCat] = useState<string>("");
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const location = useLocation();

    const openEditModal = (record: HealthRecord) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingRecord(null);
        setIsEditModalOpen(false);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Fetch all cats
    useEffect(() => {
        const fetchCats = async () => {
        try {
            const response = await fetch(`${API_URL}/cats`);
            if (!response.ok) throw new Error("Failed to fetch cats");
            const data = await response.json();
            setCats(data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch cats");
        }
        };

        fetchCats();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const catId = params.get("cat_id");

        if (catId && cats.length > 0) {
        const selectedCat = cats.find((cat) => cat.id === Number(catId));
        if (selectedCat) setSelectedCat(selectedCat.name);
        }
    }, [location.search, cats]);

    // Fetch health records for the selected cat
    const fetchHealthRecords = async () => {
        if (!selectedCat) {
        setHealthRecords([]); // Clear records if no cat is selected
        return;
        }

        setLoading(true);
        setError(null);

        try {
        const selectedCatId = cats.find((cat) => cat.name === selectedCat)?.id;
        if (!selectedCatId) throw new Error("Invalid cat selection");

        const response = await fetch(`${API_URL}/healthrecords/${selectedCatId}`);
        if (!response.ok) throw new Error("Failed to fetch health records");

        const data = await response.json();
        setHealthRecords(data);
        } catch (err) {
        console.error(err);
        setError("Failed to fetch health records");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthRecords();
    }, [selectedCat, cats]);

    return (
        <div className="p-6">
        <Typography variant="h4" color="blue-gray" className="mb-4">
            Health Records
        </Typography>

        {/* Filter and Add Record Section */}
        <div className="flex items-center gap-4 mb-4">
            {/* Dropdown to select a cat */}
            <Select
            label="Filter by Cat"
            onChange={(value) => setSelectedCat(value!)}
            value={selectedCat}
            className="flex-grow"
            >
            {cats.map((cat) => (
                <Option key={cat.id} value={cat.name}>
                {cat.name}
                </Option>
            ))}
            </Select>

            {/* Add Health Record Button */}
            <Button color="green" onClick={openModal}>
            Add Health Record
            </Button>
        </div>

        {/* Health Records Table */}
        {loading ? (
            <Typography color="blue-gray">Loading...</Typography>
        ) : error ? (
            <Typography color="red">{error}</Typography>
        ) : (
            <HealthRecordsTable
            healthRecords={healthRecords}
            onAdd={openModal}       // Open the add modal
            onEdit={openEditModal}  // Pass the edit handler
            />
        )}
        <Dialog open={isModalOpen} handler={closeModal}>
            <DialogBody>
            <AddHealthRecordForm
                onSubmit={() => {
                fetchHealthRecords(); // Refresh records after adding
                closeModal();
                }}
                onClose={closeModal}
            />
            </DialogBody>
        </Dialog>

        {/* Add Health Record Modal */}
        <Dialog open={isEditModalOpen} handler={closeEditModal} size="lg">
            <DialogBody>
                {editingRecord ? (
                <EditHealthRecordForm
                    record={editingRecord}
                    onSubmit={() => {
                    fetchHealthRecords(); // Refresh records after editing
                    closeEditModal();
                    }}
                    onClose={closeEditModal}
                />
                ) : (
                <Typography color="blue-gray" className="text-center">
                    Loading record details...
                </Typography>
                )}
            </DialogBody>
        </Dialog>
        </div>
    );
};

export default HealthRecordsTab;
