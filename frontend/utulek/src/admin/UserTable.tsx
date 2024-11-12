import { Button, Card, Dialog, DialogBody, DialogFooter, DialogHeader, Typography } from "@material-tailwind/react";
import { API_URL } from "../App";
import { useState } from "react";
import EditUserForm from "./EditUserForm";
 
const TABLE_HEAD = ["Role", "Username", "Full Name", "Email", "Telephone", "Specialization", "Verified", ""];

export interface User {
  Id: number;
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  role: string;
  Specialization?: string;
  Telephone?: string;
  verified?: boolean; 
}

// NOTES: Verified by mela za me byt ikonka misto textu
//        Role by se mela prelozit na text
//        Misto N/A pomlcky vycentrovane
//        Edit tlacitko by melo neco delat (optional) (:kapp:)
//        Sloupce by mely fitnout content
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
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.role}
                  </Typography>
                </td>
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
                    {user.Telephone || "-"}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Specialization || "-"}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.verified && (user.verified ? "Yes" : "No") || "-" }
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
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
        <Dialog open={isEditOpen} handler={closeEditModal}>
          <DialogHeader>Edit User</DialogHeader>
          <DialogBody>
            <EditUserForm
              user={selectedUser}
              onModification={() => {
                closeEditModal();
                onUpdateUser();
              }}
            />
          </DialogBody>
          <DialogFooter>
            <Button color="red" onClick={closeEditModal}>Cancel</Button>
          </DialogFooter>
        </Dialog>
      )}
    </Card>
  );
}

export default UserTable;