import React, { useMemo, useState } from 'react';
import UserTable, { User } from './UserTable';
import { Button, Dialog, DialogBody, DialogFooter } from '@material-tailwind/react';
import AddUserForm from './AddUserForm';
import { API_URL } from '../App';

const UsersDashboard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        credentials: "include",  // Include cookies for authentication
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
  
      const data = await response.json();
      console.log(data);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };



    const toggleModal = () => setIsModalOpen(!isModalOpen);
    const handleUserAdded = () => {
        setIsModalOpen(false);
        fetchUsers();
    };


    useMemo(() => { fetchUsers(); }, []);

    return (
        <div>
            <h1>Users Dashboard</h1>
            <UserTable users={users}/>
                  {/* Add New Cat Button */}
            <Button color="blue" onClick={toggleModal} className="mt-8">
                Add New User
            </Button>
        
            {/* Add New Cat Dialog */}
            <Dialog open={isModalOpen} handler={toggleModal} size="lg">
                <DialogBody>
                <AddUserForm onUserAdded={handleUserAdded} />
                </DialogBody>
                <DialogFooter>
                <Button variant="text" color="red" onClick={toggleModal} className="mr-2">
                    Cancel
                </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default UsersDashboard;