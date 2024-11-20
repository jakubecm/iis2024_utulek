import React, { useState, useEffect } from "react";
import { Button, Textarea, Typography, Option } from "@material-tailwind/react";
import { API_URL } from "../App";
import AsyncSelect from "../components/AsyncSelect";

interface Cat {
  id: number;
  name: string;
}

interface AddExaminationRequestFormProps {
    onSubmit: () => void; // Callback to refresh the parent component after a successful submission
    onClose: () => void;  // Callback to close the form
}

const AddExaminationRequestForm: React.FC<AddExaminationRequestFormProps> = ({ onSubmit, onClose }) => {
    const [cats, setCats] = useState<Cat[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
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
            if (!selectedCatId || !description.trim()) {
                throw new Error("Invalid input: Please ensure all fields are correctly filled.");
            }

            const newExaminationRequest = {
                cat_id: selectedCatId,
                description,
            };

            const response = await fetch(`${API_URL}/examinationrequests`, {
                method: "POST",
                credentials: "include", // Include cookies for authentication
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newExaminationRequest),
            });

            if (!response.ok) throw new Error("Failed to create examination request");

            onSubmit(); // Notify the parent component to refresh
            onClose();  // Close the form

        } catch (err) {
            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Typography variant="h4" color="blue-gray" className="mb-4 text-center font-semibold">
                Add Examination Request
            </Typography>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Cat */}
                <AsyncSelect
                    label="Select Cat"
                    onChange={(value) => setSelectedCatId(Number(value))}
                    value={selectedCatId ? String(selectedCatId) : ""}
                >
                    {cats.map((cat) => (
                        <Option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                        </Option>
                    ))}
                </AsyncSelect>

                {/* Description */}
                <Textarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                {/* Submit Button */}
                <Button type="submit" color="blue" fullWidth disabled={loading}>
                    {loading ? "Adding..." : "Add Request"}
                </Button>

                {/* Error Message */}
                {error && <Typography color="red" className="text-center">{error}</Typography>}
            </form>

            {/* Cancel Button */}
            <Button color="red" variant="text" fullWidth onClick={onClose} className="mt-4">
                Cancel
            </Button>
        </>
    );
};

export default AddExaminationRequestForm;
