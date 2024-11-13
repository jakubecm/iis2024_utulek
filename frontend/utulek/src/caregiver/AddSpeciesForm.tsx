import React, { useState } from "react";
import { Button, Input, Typography } from "@material-tailwind/react";
import { API_URL } from "../App";

interface AddSpeciesFormProps {
    onSpeciesAdded: () => void;
}

const AddSpeciesForm: React.FC<AddSpeciesFormProps> = ({ onSpeciesAdded }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/species`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                throw new Error("Failed to add species");
            }

            onSpeciesAdded();
            setName(''); // Reset form

        } catch (err) {
            console.error(err);
            setError("Failed to add species");

        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
        <Typography variant="h4" color="blue-gray" className="text-center font-semibold">
            Add New Species
        </Typography>
        <Input
            label="Species Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            size="lg"
        />
        <Button type="submit" color="blue" fullWidth disabled={loading}>
            {loading ? "Adding..." : "Add Species"}
        </Button>
        {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
    );
};

export default AddSpeciesForm;
