import React, { useEffect, useState } from 'react';
import { Button, Input, Textarea, Typography, Select, Option } from "@material-tailwind/react";
import { Species } from '../types';

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

  // Fetch species list from the backend when the component mounts
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch('http://localhost:5000/species');
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
      const response = await fetch('http://localhost:5000/cat/photo/upload', {
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
      const catResponse = await fetch('http://localhost:5000/cats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            required
            size="lg"
          />
          <Select
            label="Species"
            value={speciesId ? String(speciesId) : ""}
            onChange={(value) => setSpeciesId(Number(value))}
            required
            size="lg"
          >
            {speciesList.map((species) => (
              <Option key={species.id} value={String(species.id)}>
                {species.name}
              </Option>
            ))}
          </Select>
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