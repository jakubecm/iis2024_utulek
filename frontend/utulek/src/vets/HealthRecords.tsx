import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Select, Option, Typography, Dialog, DialogBody, DialogFooter } from "@material-tailwind/react";
import { API_URL } from "../App";
import HealthRecordsTable from "./HealthRecordsTable";
import AddHealthRecordForm from "./AddHealthRecordForm";
import { HealthRecord } from "../types";

interface Cat {
  id: number;
  name: string;
}

const HealthRecordsTab: React.FC = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await fetch(`${API_URL}/cats`);
        if (!response.ok) throw new Error("Failed to fetch cats");
        const data = await response.json();
        setCats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch cats");
      }
    };

    fetchCats();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get("cat_id");

    if (catId && cats.length > 0) {
      const selectedCat = cats.find((cat) => cat.id === Number(catId));
      if (selectedCat) setSelectedCat(selectedCat.name);
    }
  }, [location.search, cats]);

  useEffect(() => {
    const fetchHealthRecords = async () => {
      if (!selectedCat) {
        setHealthRecords([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const selectedCatId = cats.find((cat) => cat.name === selectedCat)?.id;
        if (!selectedCatId) throw new Error("Invalid cat selection");

        const response = await fetch(`${API_URL}/healthrecords/${selectedCatId}`);
        if (!response.ok) throw new Error("Failed to fetch health records");

        const data = await response.json();
        setHealthRecords(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch health records");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecords();
  }, [selectedCat, cats]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-6">
      <Typography variant="h4" color="blue-gray" className="mb-4">
        Health Records
      </Typography>
      <div className="flex items-center gap-4 mb-4">
        <Select
          label="Filter by Cat"
          onChange={(value) => setSelectedCat(value)}
          value={selectedCat}
          className="flex-grow"
        >
          {cats.map((cat) => (
            <Option key={cat.id} value={cat.name}>
              {cat.name}
            </Option>
          ))}
        </Select>
        <Button color="green" onClick={openModal}>
          Add Health Record
        </Button>
      </div>
      {loading ? (
        <Typography color="blue-gray">Loading...</Typography>
      ) : error ? (
        <Typography color="red">{error}</Typography>
      ) : (
        <HealthRecordsTable healthRecords={healthRecords} onAdd={openModal} />
      )}
      <Dialog open={isModalOpen} handler={closeModal}>
        <DialogBody>
          <AddHealthRecordForm
            onSubmit={() => {
              setSelectedCat(selectedCat);
              closeModal();
            }}
            onClose={closeModal}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={closeModal}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default HealthRecordsTab;
