import { Button, Card, CardBody, CardFooter, Dialog, Typography } from "@material-tailwind/react";
import { useState } from "react";
import EditUserForm from "./EditUserForm";

const Roles: { [key: number]: string } = {
  0: "Admin",
  1: "Volunteer",
  2: "Veterinarian",
  3: "Caregiver",
};

export interface User {
  Id: number;
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  role: number;
  Specialization?: string;
  Telephone?: string;
  verified?: boolean;
}

interface UserTableProps {
  users: User[];
  role: string;
  onUpdateUser: () => void; // Function to handle updates
}

const UserTable: React.FC<UserTableProps> = ({ users, role, onUpdateUser }) => {
  type RoleType = keyof typeof columnConfig;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsEditOpen(false);
  };

  const columnConfig = {
    admin: ["Username", "Full Name", "Email", "Role", ""],
    veterinarian: ["Username", "Full Name", "Email", "Role", "Specialization", "Telephone", ""],
    caregiver: ["Username", "Full Name", "Email", "Role", ""],
    volunteer: ["Username", "Full Name", "Email", "Verified", ""],
  };

  const displayColumns = columnConfig[role as RoleType];

  return (
    <Card className="h-full w-full">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {displayColumns.map((col) => (
              <th key={col} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                  {col}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.Id}>
              {displayColumns.includes("Username") && (
                <td className="p-2 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Username}
                  </Typography>
                </td>
              )}
              {displayColumns.includes("Full Name") && (
                <td className="p-2 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {`${user.FirstName} ${user.LastName}`}
                  </Typography>
                </td>
              )}
              {displayColumns.includes("Email") && (
                <td className="p-2 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Email}
                  </Typography>
                </td>
              )}
              {displayColumns.includes("Role") && (
                <td className="p-2 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {Roles[user.role]}
                  </Typography>
                </td>
              )}
              {displayColumns.includes("Specialization") && (
                <td className="p-2 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Specialization || "-"}
                  </Typography>
                </td>
              )}
              {displayColumns.includes("Telephone") && (
                <td className="p-2 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Telephone || "-"}
                  </Typography>
                </td>
              )}
              {displayColumns.includes("Verified") && (
                <td className="p-2 border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.verified ? "Yes" : "No"}
                  </Typography>
                </td>
              )}
              <td className="p-2 border-b border-blue-gray-50 text-right">
                <Button color="blue" onClick={() => openEditModal(user)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <Dialog open={isEditOpen} handler={closeEditModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
          <Card className="mx-auto w-full !max-w-[30rem] !min-w-[26rem] px-2">
            <CardBody className="flex flex-col gap-4">
              <EditUserForm
                user={selectedUser}
                onModification={() => {
                  closeEditModal();
                  onUpdateUser();
                }}
              />
            </CardBody>
            <CardFooter>
              <Button variant="text" color="red" onClick={closeEditModal} className="mr-2">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </Dialog>
      )}
    </Card>
  );
};

export default UserTable;
