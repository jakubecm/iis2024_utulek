import React, { useEffect, useState } from 'react';
import { Button, Input, Textarea, Typography, Option } from "@material-tailwind/react";
import { Species } from '../types';
import { API_URL } from "../App";
import AsyncSelect from './AsyncSelect';

interface AddCatFormProps {
  onCatAdded: (cat: { id: number; name: string; species_id: number; age: number; description: string; found: string }) => void;
}

const AddCatForm: React.FC<AddCatFormProps> = ({ onCatAdded }) => {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [found, setFound] = useState('');
  const [file, setFile] = useState<File | null>(null); // State for selected file
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  // Fetch species list from the backend when the component mounts
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

  // Upload the photo for the cat
  const uploadPhoto = async (catId: number) => {
    if (!file) return; // Exit if no file is selected
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cat_id', String(catId));
  
    console.log("Uploading photo for cat ID:", catId);
  
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

    const validationErrors: { [key: string]: string } = {};

    if (!speciesId) validationErrors.speciesId = "Species is required.";
    if (age === '' || age < 0 || age > 40) validationErrors.age = "Age must be a value between 0 and 40.";
    if (description.trim().length < 10)
      validationErrors.description = "Description must be at least 10 characters.";

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      setLoading(false);
      return;
    }
  
    try {
      // Prepare data for submission
      const catData: any = {
        name,
        species_id: Number(speciesId),
        age: Number(age),
        description,
      };
  
      if (found) {
        catData.found = found;
      }
  
      // Create the cat
      const catResponse = await fetch(`${API_URL}/cats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(catData),
      });
      
      console.log("Cat created, response status:", catResponse.status);
  
      if (!catResponse.ok) throw new Error("Failed to add cat");
  
      const newCat = await catResponse.json();
      onCatAdded(newCat);
  
      // Upload the photo if available
      if (file && newCat.id) {
        await uploadPhoto(newCat.id);
      }
  
      // Reset form fields after successful submission
      setName('');
      setSpeciesId('');
      setAge('');
      setDescription('');
      setFound('');
      setFile(null);

    } catch (err) {
      console.error(err);
      setError("Failed to add cat");

    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <Typography variant="h4" color="blue-gray" className="mb-4 text-center font-semibold">
          Add a New Cat
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="lg"
            required
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
          {errors.speciesId && <p className="text-red-500 text-sm">{errors.speciesId}</p>}
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            size="lg"
            required
          />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="lg"
            required
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          <Input
            label="Found Date"
            type="date"
            value={found}
            onChange={(e) => setFound(e.target.value)}
            size="lg"
            required
          />
          {/* File input for photo */}
          <Input
            label="Upload Photo"
            type="file"
            onChange={(e) => {
              const selectedFile = e.target.files ? e.target.files[0] : null;
              setFile(selectedFile);
              console.log("Selected file:", selectedFile);
            }}
            size="lg"
          />
          <Button type="submit" color="blue" fullWidth disabled={loading}>
            {loading ? "Adding Cat..." : "Add Cat"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default AddCatForm;
