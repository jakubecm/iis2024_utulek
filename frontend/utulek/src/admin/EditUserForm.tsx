import React, { useState } from "react";
import { Button, Input, Select, Option, Typography } from "@material-tailwind/react";
import { User } from "./UserTable";
import { API_URL } from "../App";

interface EditUserFormProps {
    user: User;
    onModification: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onModification }) => {
    const [username, setUsername] = useState(user.Username);
    const [firstName, setFirstName] = useState(user.FirstName);
    const [lastName, setLastName] = useState(user.LastName);
    const [email, setEmail] = useState(user.Email);
    const [role, setRole] = useState(user.role);
    const [specialization, setSpecialization] = useState(user.Specialization || "");
    const [telephone, setTelephone] = useState(user.Telephone || "");
    const [verified, setVerified] = useState(user.verified || false);
    const Id = user.Id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare updated user data
        const userData = {
            ...user,
            Username: username,
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            role: role,
            Specialization: role === "2" ? specialization : undefined,
            Telephone: role === "2" ? telephone : undefined,
            verified: role === "1" ? verified : undefined,
        };

        console.log(userData);

        const response = await fetch(`${API_URL}/admin/users/${user.Id}`, {
            method: "PUT",
            credentials: "include",  // Include cookies for authentication
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        console.log(userData);
        console.log(response);

        onModification();  // Callback to save updated user data
    };

    const handleDelete = async () => {
        const response = await fetch(`${API_URL}/admin/users/${Id}`, {
            method: "DELETE",
            credentials: "include",  // Include cookies for authentication
        });

        onModification();  // Callback to remove user from the list
        console.log(response);
    }

    return (
        <>
        <Typography variant="h4" color="blue-gray" className="mb-4 text-center font-semibold">
            Edit User
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                size="lg"
            />
            <Input
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                size="lg"
            />
            <Input
                label="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                size="lg"
            />
            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
            />
            <Select label="Role" value={role} onChange={(value = "1") => setRole(value)} size="lg">
                <Option value="1">Volunteer</Option>
                <Option value="2">Veterinarian</Option>
            </Select>
            {role === "2" && (
                <>
                    <Input
                        label="Specialization"
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        size="lg"
                    />
                    <Input
                        label="Telephone"
                        type="text"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        size="lg"
                    />
                </>
            )}
            {role === "1" && (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={verified}
                        onChange={(e) => setVerified(e.target.checked)}
                        className="mr-2"
                    />
                    <label>Verified</label>
                </div>
            )}
            <div className="flex justify-end space-x-4">
                <Button type="button" color="red" onClick={handleDelete}>
                    Delete
                </Button>
                <Button type="submit" color="blue">
                    Save Changes
                </Button>
            </div>
        </form>
        </>
    );
};

export default EditUserForm;
