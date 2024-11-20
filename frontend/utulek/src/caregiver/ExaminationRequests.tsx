import React, { useState, useEffect, useCallback } from "react";
import ExaminationRequestsTable from "./ExaminationRequestsTable";
import AddExaminationRequestForm from "./AddExaminationRequestForm";
import EditExaminationRequestForm from "./EditExaminationRequestForm";
import { Button, Dialog, DialogBody, DialogFooter, Typography } from "@material-tailwind/react";
import { Role } from "../auth/jwt";
import { useAuth } from "../auth/AuthContext";
import { API_URL } from "../App";
import { ExaminationRequest } from "../types";

const ExaminationRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<ExaminationRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<ExaminationRequest | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { role } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setError(null);

        try {
            const endpoint = `${API_URL}/examinationrequests`;
            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include",
                headers: {
                "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch examination requests");
            }

            const data = await response.json();
            setRequests(data);

        } catch (err) {
            console.error(err);
            setError("Failed to fetch examination requests");
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAddRequest = () => setIsAddModalOpen(true);
    const closeAddRequestModal = () => {
        setIsAddModalOpen(false);
        fetchRequests();
    };

    const handleEditRequest = (request: ExaminationRequest) => {
        setSelectedRequest(request);
        setIsEditModalOpen(true);
    };

    const closeEditRequestModal = () => {
        setSelectedRequest(null);
        setIsEditModalOpen(false);
        fetchRequests();
    };

    return (
        <div className="p-6">
            <Typography variant="h4" color="blue-gray" className="mb-4">
                    Examination Requests
            </Typography>
            {error && (
                <Typography color="red" className="mb-4">
                    {error}
                </Typography>
            )}
            {(role === Role.CAREGIVER || role === Role.ADMIN) && (
                <Button color="green" onClick={handleAddRequest} className="mb-4">
                    Add New Request
                </Button>
            )}
            <ExaminationRequestsTable requests={requests} onEdit={handleEditRequest} />

            {/* Add Modal */}
            {isAddModalOpen && (
                <Dialog open={isAddModalOpen} handler={closeAddRequestModal} size="lg">
                <DialogBody>
                    <AddExaminationRequestForm
                        onClose={closeAddRequestModal}
                        onSubmit={fetchRequests}
                    />
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={closeAddRequestModal}>
                        Cancel
                    </Button>
                </DialogFooter>
                </Dialog>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedRequest && (
                <Dialog open={isEditModalOpen} handler={closeEditRequestModal} size="lg">
                <DialogBody>
                    <EditExaminationRequestForm
                        request={selectedRequest}
                        onClose={closeEditRequestModal}
                        onSubmit={fetchRequests}
                    />
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={closeEditRequestModal}>
                        Cancel
                    </Button>
                </DialogFooter>
                </Dialog>
            )}
        </div>
    );
};

export default ExaminationRequestsPage;
