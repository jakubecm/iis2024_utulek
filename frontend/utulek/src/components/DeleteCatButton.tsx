import React from 'react';

interface DeleteCatButtonProps {
  catId: number;
  onCatDeleted: (catId: number) => void;
}

const DeleteCatButton: React.FC<DeleteCatButtonProps> = ({ catId, onCatDeleted }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/cats/${catId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Handle error if the response is not ok
        const errorData = await response.json();
        console.error("Error deleting cat:", errorData);
        alert(`Error deleting cat: ${errorData.msg}`);
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

  return <button onClick={handleDelete}>Delete</button>;
};

export default DeleteCatButton;
