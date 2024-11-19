import React, { useMemo, useState } from 'react';
import UserTable, { User } from './UserTable';
import { Button, Card, CardBody, CardFooter, Dialog } from '@material-tailwind/react';
import AddUserForm from './AddUserForm';
import { API_URL } from '../App';

const UsersDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
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

  useMemo(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="font-bold leading-snug tracking-tight text-slate-800 my-6 w-full text-2xl lg:max-w-3xl lg:text-5xl">
        Users Dashboard
      </h1>
      <UserTable users={users} onUpdateUser={handleUserAdded} />
      <Button color="blue" onClick={toggleModal} className="mt-8">
        Add New User
      </Button>
      <Dialog open={isModalOpen} handler={toggleModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
        <Card className="mx-auto w-full !max-w-[30rem] !min-w-[26rem] px-2">
          <CardBody className="flex flex-col gap-4">
            <AddUserForm onUserAdded={handleUserAdded} />
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="text" color="red" onClick={toggleModal} className="mr-2">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
    </div>
  );
};

export default UsersDashboard;
