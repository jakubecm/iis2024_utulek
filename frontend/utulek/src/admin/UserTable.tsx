import { Card, Typography } from "@material-tailwind/react";
import { API_URL } from "../App";
import { useMemo, useState } from "react";
 
const TABLE_HEAD = ["Role", "Username", "Full Name", "Email", "Telephone", "Specialization", "Verified", ""];

export interface User {
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
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
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
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
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
                    {user.Telephone || "N/A"}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.Specialization || "N/A"}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.verified ? "Yes" : "No"}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography as="a" href="#" variant="small" color="blue-gray" className="font-medium">
                    Edit
                  </Typography>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

export default UserTable;