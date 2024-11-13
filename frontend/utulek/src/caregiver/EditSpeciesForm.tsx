import React, { useState } from "react";
import { Button, Input} from "@material-tailwind/react";
import { API_URL } from "../App";

interface EditSpeciesFormProps {
    species: { id: number; name: string };
    onModification: () => void;
}

const EditSpeciesForm: React.FC<EditSpeciesFormProps> = ({ species, onModification }) => {
    const [name, setName] = useState(species.name);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/species/${species.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                throw new Error("Failed to edit species");
            }
            onModification();

        } catch (err) {
            console.error("Error editing species:", err);

        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
          const response = await fetch(`${API_URL}/species/${species.id}`, {
            method: 'DELETE',
          });
    
          if (response.ok) {
            onModification(); // Refresh the list after successful delete
          } else {
            console.error("Failed to delete species");
          }
        } catch (error) {
          console.error("Error deleting species:", error);
        }
    };
    
    return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Species Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="flex justify-end space-x-4">
            <Button color="red" onClick={handleDelete} disabled={loading}> {/* Delete button */}
              Delete
            </Button>
            <Button type="submit" color="blue" disabled={loading}> {/* Save Changes button */}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
    );
};
    
export default EditSpeciesForm;
