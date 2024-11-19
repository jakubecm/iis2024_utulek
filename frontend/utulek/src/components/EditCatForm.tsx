import React, { useEffect, useState } from 'react';
import { Button, Input, Textarea, Typography, Select, Option } from "@material-tailwind/react";
import { Cat } from '../types';
import { Species } from '../types';
import { API_URL } from "../App";
import AsyncSelect from './AsyncSelect';

interface EditCatFormProps {
  cat: Cat;
  onCatUpdated: (updatedCat: Cat) => void;
  onClose: () => void;
}

const EditCatForm: React.FC<EditCatFormProps> = ({ cat, onCatUpdated, onClose }) => {
  const [name, setName] = useState(cat.name);
  const [speciesId, setSpeciesId] = useState<number | ''>(cat.species_id || '');
  const [age, setAge] = useState<number | ''>(cat.age || '');
  const [description, setDescription] = useState(cat.description || '');
  const [found, setFound] = useState(cat.found || '');
  const [file, setFile] = useState<File | null>(null); // State for new photo file
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch(`${API_URL}/species`);
        const data = await response.json();
        setSpeciesList(data);

      } catch (err) {
        console.error("Error fetching species:", err);
      }
    };
    
    fetchSpecies();
  }, []);

  const handlePhotoUpload = async () => {
    if (!file) return; // Skip if no file is selected

    const formData = new FormData();
    formData.append('file', file);
    formData.append('cat_id', String(cat.id));

    try {
      const response = await fetch(`${API_URL}/cat/photo/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to upload photo');

    } catch (err) {
      console.error("Error uploading photo:", err);
      setError("Failed to upload photo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedCatData = {
        name,
        species_id: Number(speciesId),
        age: Number(age),
        description,
        found,
      };

      const response = await fetch(`${API_URL}/cats/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedCatData),
      });

      if (!response.ok) throw new Error("Failed to update cat");

      const updatedCat = await response.json();
      onCatUpdated(updatedCat);

      if (file) {
        await handlePhotoUpload(); // Upload new photo if provided
      }

      onClose();

    } catch (err) {
      console.error(err);
      setError("Failed to update cat");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <Typography variant="h4" color="blue-gray" className="mb-4 text-center font-semibold">
          Edit Cat Details
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            size="lg"
          />
          <AsyncSelect
            label="Species"
            value={String(speciesId)}
            onChange={(idAsString) => setSpeciesId(Number(idAsString))}
            size="lg"
            >
            {speciesList.map((species) => (
              <Option key={species.id} value={String(species.id)}>
                {species.name}
              </Option>
            ))}
          </AsyncSelect>
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            size="lg"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="lg"
          />
          <Input
            label="Found Date"
            type="date"
            value={found}
            onChange={(e) => setFound(e.target.value)}
            size="lg"
          />
          <Input
            label="Upload New Photo"
            type="file"
            onChange={(e) => {
              const selectedFile = e.target.files ? e.target.files[0] : null;
              setFile(selectedFile);
              console.log("Selected file:", selectedFile);
            }}
            size="lg"
          />
          <Button type="submit" color="blue" fullWidth disabled={loading}>
            {loading ? "Updating Cat..." : "Update Cat"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        <Button color="red" variant="text" fullWidth onClick={onClose} className="mt-4">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditCatForm;
