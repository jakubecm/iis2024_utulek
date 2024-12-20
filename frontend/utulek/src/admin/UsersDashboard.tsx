import React, { useState, useEffect } from 'react';
import UserTable, { User } from './UserTable';
import { Button, Card, CardBody, CardFooter, Dialog, Tabs, TabsHeader, TabsBody, Tab, TabPanel} from '@material-tailwind/react';
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const adminUsers = users.filter((user) => user.role === 0);
  const volunteerUsers = users.filter((user) => user.role === 1 || user.role === 4);
  const veterinarianUsers = users.filter((user) => user.role === 2);
  const caregiverUsers = users.filter((user) => user.role === 3);
  
  return (
    <div>
      <h1 className="font-bold leading-snug tracking-tight text-slate-800 my-6 w-full text-xl lg:max-w-xl lg:text-3xl">
        Admin Dashboard - User Management
      </h1>
      <Tabs value="admin">
        <TabsHeader>
          <Tab key="admin" value="admin" className='font-bold'>Admins</Tab>
          <Tab key="volunteer" value="volunteer" className='font-bold'>Volunteers</Tab>
          <Tab key="veterinarian" value="veterinarian" className='font-bold'>Veterinarians</Tab>
          <Tab key="caregiver" value="caregiver" className='font-bold'>Caregivers</Tab>
        </TabsHeader>
        <TabsBody>
          <TabPanel key="admin" value="admin">
            <UserTable users={adminUsers} role="admin" onUpdateUser={handleUserAdded} />
          </TabPanel>
          <TabPanel key="volunteer" value="volunteer">
            <UserTable users={volunteerUsers} role="volunteer" onUpdateUser={handleUserAdded} />
          </TabPanel>
          <TabPanel key="veterinarian" value="veterinarian">
            <UserTable users={veterinarianUsers} role="veterinarian" onUpdateUser={handleUserAdded} />
          </TabPanel>
          <TabPanel key="caregiver" value="caregiver">
            <UserTable users={caregiverUsers} role="caregiver" onUpdateUser={handleUserAdded} />
          </TabPanel>
        </TabsBody>
      </Tabs>
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
