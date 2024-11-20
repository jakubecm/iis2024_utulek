import React, { useState, useEffect } from "react";
import { Button, Textarea, Select, Option, Typography } from "@material-tailwind/react";
import { API_URL } from "../App";
import { Role } from "../auth/jwt";
import { useAuth } from "../auth/AuthContext";
import AsyncSelect from "../components/AsyncSelect";

interface Cat {
    id: number;
    name: string;
}

interface EditExaminationRequestFormProps {
    request: {
        id: number;
        cat_id: number;
        cat_name: string;
        caregiver_name: string;
        request_date: string;
        description: string;
        status: number;
    };
    onClose: () => void;
    onSubmit: () => void;
}

const EditExaminationRequestForm: React.FC<EditExaminationRequestFormProps> = ({
    request,
    onClose,
    onSubmit,
}) => {
    const { role } = useAuth();
    const [description, setDescription] = useState(request.description);
    const [status, setStatus] = useState<number>(request.status);
    const [catId, setCatId] = useState<number>(request.cat_id);
    const [cats, setCats] = useState<Cat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch cats and include the currently selected cat
    useEffect(() => {
        if (role === Role.CAREGIVER || role === Role.ADMIN) {
            const fetchCats = async () => {
                try {
                    const response = await fetch(`${API_URL}/cats`);
                    if (!response.ok) throw new Error("Failed to fetch cats");

                    const data = await response.json();

                    // Include the currently selected cat if not already in the fetched list
                    const isSelectedCatIncluded = data.some((cat: Cat) => cat.id === request.cat_id);
                    if (!isSelectedCatIncluded) {
                        data.push({ id: request.cat_id, name: request.cat_name });
                    }

                    setCats(data);

                } catch (err) {
                    console.error(err);
                }
            };

            fetchCats();
        }
    }, [role, request.cat_id, request.cat_name]);

    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/examinationrequests/${request.id}`, {
                method: "DELETE",
                credentials: "include",
            });
    
            if (!response.ok) throw new Error("Failed to delete examination request");
    
            onSubmit();
            onClose();

        } catch (err) {
            console.error(err);
            setError("Failed to delete examination request");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updatedRequest = {
                id: request.id,
                cat_id: role === Role.CAREGIVER || role === Role.ADMIN ? catId : request.cat_id,
                description: role === Role.CAREGIVER || role === Role.ADMIN ? description : request.description,
                status, // Always include status
            };

            const response = await fetch(`${API_URL}/examinationrequests/${request.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedRequest),
            });

            if (!response.ok) throw new Error("Failed to update examination request");

            onSubmit();
            onClose();

        } catch (err) {
            console.error(err);
            setError("Failed to update examination request");

        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Typography variant="h4" color="blue-gray" className="mb-4">
                Edit Examination Request
            </Typography>

            {/* Cat Selector */}
            {(role === Role.CAREGIVER || role === Role.ADMIN) && (
                <AsyncSelect
                    label="Select Cat"
                    value={String(catId)}
                    onChange={(value) => setCatId(Number(value))}
                >
                    {cats.map((cat) => (
                        <Option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                        </Option>
                    ))}
                </AsyncSelect>
            )}

            {/* Description Field */}
            {(role === Role.CAREGIVER || role === Role.ADMIN) && (
                <Textarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            )}

            {/* Status Field */}
            {(role === Role.ADMIN || role === Role.VETS) && (
                <Select
                    label="Status"
                    value={String(status)}
                    onChange={(value) => setStatus(Number(value))}
                >
                    <Option value="0">Pending</Option>
                    <Option value="1">Approved</Option>
                    <Option value="2">Rejected</Option>
                    <Option value="3">Scheduled</Option>
                    <Option value="4">Completed</Option>
                </Select>
            )}

            {/* Error Message */}
            {error && <Typography color="red">{error}</Typography>}

            <div className="flex justify-between">
                {/* Submit Button */}
                <Button type="submit" color="blue" disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                </Button>

                {/* Delete Button */}
                {((role === Role.CAREGIVER && request.status === 0) || role === Role.ADMIN) && (
                    <Button color="red" variant="text" onClick={handleDelete}>
                        Delete
                    </Button>
                )}
            </div>
        </form>
    );
};

export default EditExaminationRequestForm;
