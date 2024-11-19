import React, { useState } from "react";
import { Button, Input, Select, Option, Typography } from "@material-tailwind/react";
import { API_URL } from "../App";

interface AddUserFormProps {
    onUserAdded: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onUserAdded }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('1');
    const [specialization, setSpecialization] = useState('');
    const [telephone, setTelephone] = useState('');
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userData: unknown = {
                username: username,
                password: password,
                first_name: firstName,
                last_name: lastName,
                email: email,
                role: role,
                ...(role === '2' && { Specialization: specialization, Telephone: telephone }),
                verified: role === '1' ? verified : undefined,
            };


            const response = await fetch(`${API_URL}/admin/users`, {
                method: "POST",
                credentials: "include",  // Include cookies for authentication
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            console.log(userData);

            if (!response.ok) throw new Error("Failed to add user");
            onUserAdded();

            // Reset form fields after successful submission
            setUsername('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setEmail('');
            setRole('');
            setSpecialization('');
            setTelephone('');
            setVerified(false);

        } catch (err) {
            console.error(err);
            setError("Failed to add user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <Typography variant="h4" color="blue-gray" className="mb-4 text-center font-semibold">
                    Add a New User
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
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    <Select
                        label="Role"
                        value={role}
                        onChange={(value = '1') => setRole(value)}
                        size="lg"
                    >
                        <Option value="0">Admin</Option>
                        <Option value="1">Volunteer</Option>
                        <Option value="2">Veterinarian</Option>
                        <Option value="3">Caregiver</Option>
                    </Select>

                    {role === '2' && (
                        <>
                            <Input
                                label="Specialization"
                                type="text"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                required
                                size="lg"
                            />
                            <Input
                                label="Telephone"
                                type="text"
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                required
                                size="lg"
                            />
                        </>
                    )}

                    {role === '1' && (
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

                    <Button type="submit" color="blue" fullWidth disabled={loading}>
                        {loading ? "Adding User..." : "Add User"}
                    </Button>
                </form>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default AddUserForm;
