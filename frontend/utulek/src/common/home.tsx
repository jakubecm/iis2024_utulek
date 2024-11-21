import React, { useEffect, useState } from "react";
import AddCatForm from "../components/AddCatForm";
import EditCatForm from "../components/EditCatForm";
import DeleteCatButton from "../components/DeleteCatButton";
import { Card, CardBody, CardFooter, Typography, Button, Dialog, DialogBody, DialogFooter } from "@material-tailwind/react";
import { Cat } from "../types";
import { useAuth } from "../auth/AuthContext";
import { Role } from "../auth/jwt";
import { API_URL } from "../App";
import { useNavigate } from "react-router-dom";
import ListIcon from '@mui/icons-material/List';

const CatList: React.FC = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [photoIndices, setPhotoIndices] = useState<{ [key: number]: number }>({});
  const { isAuthenticated, role } = useAuth();
  const [species, setSpecies] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();
  const [isDefaultImageAvailable, setIsDefaultImageAvailable] = useState(true);

  const fetchCats = () => {
    fetch(`${API_URL}/cats`)
      .then((response) => response.json())
      .then((data) => {
        setCats(data);
        const initialIndices: { [key: number]: number } = {};
        data.forEach((cat: Cat) => {
          initialIndices[cat.id] = 0;
        });
        setPhotoIndices(initialIndices);
      })
      .catch((error) => console.error("Error fetching cats:", error));
  };

  const defaultImageAvailable = () => {
    fetch(`${API_URL}/catphotos/default-image.png`, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) {
          setIsDefaultImageAvailable(false);
        }
      })
      .catch(() => {
        setIsDefaultImageAvailable(false);
      });
  };

  useEffect(() => {
    fetchCats();
    defaultImageAvailable();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/species`)
      .then((response) => response.json())
      .then((data) => {
        const speciesMap: { [key: number]: string } = {};
        data.forEach((sp: { id: number; name: string }) => {
          speciesMap[sp.id] = sp.name;
        });
        setSpecies(speciesMap);
      })
      .catch((error) => console.error("Error fetching species:", error));
  }, []);

  const handleCatAdded = (newCat: Cat) => {
    fetchCats();
    setIsModalOpen(false);
  };

  const handleCatDeleted = (deletedCatId: number) => {
    fetchCats();
  };

  const handleCatUpdated = (updatedCat: Cat) => {
    fetchCats();
    setSelectedCat(null);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleNextPhoto = (catId: number) => {
    setPhotoIndices((prevIndices) => ({
      ...prevIndices,
      [catId]: (prevIndices[catId] + 1) % (cats.find((cat) => cat.id === catId)?.photos.length || 1),
    }));
  };

  const handlePreviousPhoto = (catId: number) => {
    setPhotoIndices((prevIndices) => {
      const photoCount = cats.find((cat) => cat.id === catId)?.photos.length || 1;
      return {
        ...prevIndices,
        [catId]: (prevIndices[catId] - 1 + photoCount) % photoCount,
      };
    });
  };

  const navigateToHealthRecords = (catId: number) => {
    navigate(`/vets/healthrecords?cat_id=${catId}`);
  };

  const getImageUrl = (cat: Cat) => {
    const currentPhotoIndex = photoIndices[cat.id] || 0;
    if (cat.photos && cat.photos.length > 0) {
      return `${API_URL}/${cat.photos[currentPhotoIndex].replace("./", "")}`;
    }

    if (isDefaultImageAvailable) {
      return `${API_URL}/catphotos/default-image.png`;
    }
    
    return ""; // No fallback image
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-6">
      <Typography variant="h3" color="blue-gray" className="mb-8 text-center">
        Available Cats
      </Typography>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {cats.map((cat) => {
          const imageUrl = getImageUrl(cat);
          return (
            <Card key={cat.id} className="w-full max-w-md mx-auto shadow-lg">
              <div className="relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    className="h-64 w-full object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"; // Hide broken image
                    }}
                  />
                ) : (
                  <Typography color="gray" className="text-center py-10">
                    No image available
                  </Typography>
                )}
                {cat.photos && cat.photos.length > 1 && (
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-2">
                    <Button color="blue-gray" size="sm" onClick={() => handlePreviousPhoto(cat.id)}>
                      &lt;
                    </Button>
                    <Button color="blue-gray" size="sm" onClick={() => handleNextPhoto(cat.id)}>
                      &gt;
                    </Button>
                  </div>
                )}
              </div>
              <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-2 font-semibold">
                  {cat.name}
                </Typography>
                <Typography color="gray" className="text-sm mb-2">
                  Age: {cat.age}
                </Typography>
                <Typography color="gray" className="text-sm mb-2">
                  Species: {species[cat.species_id] || "Unknown"}
                </Typography>
                <Typography color="gray" className="text-sm">{cat.description}</Typography>
              </CardBody>
              <CardFooter className="flex justify-between">
                {(role === Role.CAREGIVER || role === Role.VETS || role === Role.ADMIN) && (
                  <Button
                    color="blue-gray"
                    size="sm"
                    onClick={() => navigateToHealthRecords(cat.id)}
                    className="mr-3"
                  >
                    <ListIcon fontSize="small" /> Health Records
                  </Button>
                )}
                {(role === Role.CAREGIVER || role === Role.ADMIN) && (
                  <>
                    <Button color="blue-gray" className="mr-3" onClick={() => setSelectedCat(cat)}>
                      Edit
                    </Button>
                    <DeleteCatButton catId={cat.id} onCatDeleted={handleCatDeleted} />
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {(role === Role.CAREGIVER || role === Role.ADMIN) && (
        <Button color="blue" onClick={toggleModal} className="mt-8">
          Add New Cat
        </Button>
      )}
      <Dialog open={isModalOpen} handler={toggleModal} size="xs" className="!max-w-[30rem] !min-w-[26rem]">
        <Card className="mx-auto w-full !max-w-[30rem] !min-w-[26rem] px-2">
          <CardBody className="flex flex-col gap-4">
            <AddCatForm onCatAdded={handleCatAdded} />
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="text" color="red" onClick={toggleModal} className="mr-2 ml-a">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
      {selectedCat && (
        <Dialog open={Boolean(selectedCat)} handler={() => setSelectedCat(null)} size="lg">
          <DialogBody>
            <EditCatForm cat={selectedCat} onCatUpdated={handleCatUpdated} onClose={() => setSelectedCat(null)} />
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="red" onClick={() => setSelectedCat(null)} className="mr-2">
              Cancel
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};

export default CatList;
