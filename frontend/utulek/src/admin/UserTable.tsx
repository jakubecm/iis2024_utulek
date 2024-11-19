import { Button, Card, CardBody, CardFooter, Dialog, Typography } from "@material-tailwind/react";
import { useState } from "react";
import EditUserForm from "./EditUserForm";
 
const TABLE_HEAD = ["Username", "Full Name", "Email", "Role", "Telephone", "Specialization", "Verified", ""];

const Roles: { [key: number]: string } = {
  0: "Admin",
  1: "Volunteer",
  2: "Veterinarian",
  3: "Caregiver",
}

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
  onUpdateUser: () => void; // Function to handle updates
}

const UserTable: React.FC<UserTableProps> = ({ users, onUpdateUser }) => {
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

  return (
    <Card className="h-full w-full overflow-scroll">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal leading-none opacity-70"
                >
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const isLast = index === users.length - 1;
            const classes = isLast ? "p-2" : "p-2 border-b border-blue-gray-50";
            const fullName = `${user.FirstName} ${user.LastName}`;

            return (
              <tr key={user.Username}>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Username}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {fullName}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Email}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {Roles[user.role]}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Telephone || "-"}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Specialization || "-"}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.verified && (user.verified ? "Yes" : "No") || "-" }
                  </Typography>
                </td>
                <td className={classes}>
                <Button color="blue" onClick={() => openEditModal(user)}>
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Edit Modal */}
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
}

export default UserTable;
