import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, Typography, Option } from "@material-tailwind/react";
import { API_URL } from "../App";
import { HealthRecord } from "../types";
import AsyncSelect from '../components/AsyncSelect';

interface Cat {
  id: number;
  name: string;
}

interface EditHealthRecordFormProps {
  record: HealthRecord; // The health record being edited
  onSubmit: () => void; // Callback to refresh the parent component after successful submission
  onClose: () => void;  // Callback to close the form
}

const EditHealthRecordForm: React.FC<EditHealthRecordFormProps> = ({ record, onSubmit, onClose }) => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(record.cat_id || null);
  const [date, setDate] = useState<string>(record.date || "");
  const [description, setDescription] = useState<string>(record.description || "");
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

      const updatedHealthRecord = {
        cat_id: selectedCatId,
        date,
        description,
      };

      console.log("Request Body:", updatedHealthRecord);

      // Send update request to the API
      const response = await fetch(`${API_URL}/healthrecord/${record.id}`, {
        method: "PUT",
        credentials: "include", // Include cookies for authentication
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedHealthRecord),
      });

      if (!response.ok) throw new Error("Failed to update health record");

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
          Edit Health Record
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Cat */}
          <AsyncSelect
            label="Select Cat"
            onChange={(value) => setSelectedCatId(Number(value))}
            value={selectedCatId ? String(selectedCatId) : ""}
            disabled
          >
            {cats.map((cat) => (
              <Option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </Option>
            ))}
          </AsyncSelect>

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
            {loading ? "Updating..." : "Update Record"}
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

export default EditHealthRecordForm;
