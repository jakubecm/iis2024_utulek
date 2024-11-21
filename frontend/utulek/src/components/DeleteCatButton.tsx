import React from 'react';
import { Button } from "@material-tailwind/react";
import { API_URL } from "../App";

interface DeleteCatButtonProps {
  catId: number;
  onCatDeleted: (catId: number) => void;
}

const DeleteCatButton: React.FC<DeleteCatButtonProps> = ({ catId, onCatDeleted }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/cats/${catId}`, {
        credentials: 'include',
        method: 'DELETE',
      });

      if (!response.ok) {
        // Handle error if the response is not ok
        const errorData = await response.json();
        console.error("Error deleting cat:", errorData);
        return;
      }

      // Call the onCatDeleted callback to remove the cat from the UI
      // backend will delete the images of the cat aswell
      onCatDeleted(catId);
    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to delete cat. Please try again.");
    }
  };

  return <Button color='red' onClick={handleDelete}>Delete</Button>;
};

export default DeleteCatButton;
