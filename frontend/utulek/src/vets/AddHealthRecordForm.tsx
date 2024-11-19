import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, Typography, Select, Option } from "@material-tailwind/react";
import { API_URL } from "../App";

interface Cat {
  id: number;
  name: string;
}

interface AddHealthRecordFormProps {
    onSubmit: () => void; // Callback to refresh the parent component after a successful submission
    onClose: () => void;  // Callback to close the form
}

const AddHealthRecordForm: React.FC<AddHealthRecordFormProps> = ({ onSubmit, onClose }) => {
    const [cats, setCats] = useState<Cat[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
    const [date, setDate] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch cats for the dropdown
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

    try {
        // Validate inputs
        if (!selectedCatId || !date || isNaN(Date.parse(date))) {
            throw new Error("Invalid input: Please ensure all fields are correctly filled.");
        }

        const newHealthRecord = {
            date,
            description,
        };

        // Include cat_id in the API URL
        const response = await fetch(`${API_URL}/healthrecords/${selectedCatId}`, {
            method: "POST",
            credentials: "include", // Include cookies for authentication
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newHealthRecord),
        });

        if (!response.ok) throw new Error("Failed to add health record");

        onSubmit(); // Notify the parent component to refresh
        onClose();  // Close the form

    } catch (err) {
        console.error(err);
        setError(err.message || "Failed to add health record");

    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <Typography variant="h4" color="blue-gray" className="mb-4 text-center font-semibold">
            Add Health Record
            </Typography>
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Cat */}
            <Select
                label="Select Cat"
                onChange={(value) => setSelectedCatId(Number(value))}
                value={selectedCatId ? String(selectedCatId) : ""}
                required
            >
                <Option value="" disabled>
                    Choose Cat
                </Option>
                {cats.map((cat) => (
                <Option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                </Option>
                ))}
            </Select>

            {/* Date */}
            <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />

            {/* Description */}
            <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />

            {/* Submit Button */}
            <Button type="submit" color="blue" fullWidth disabled={loading}>
                {loading ? "Adding..." : "Add Record"}
            </Button>

            {/* Error Message */}
            {error && <Typography color="red" className="text-center">{error}</Typography>}
        </form>

        {/* Cancel Button */}
        <Button color="red" variant="text" fullWidth onClick={onClose} className="mt-4">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddHealthRecordForm;
