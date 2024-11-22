export interface Cat {
    id: number;
    name: string;
    age: number;
    description: string;
    found: string;
    photos: string[];
    species_id: number;
  }
  
export interface Species {
    id: number;
    name: string;
  }

export interface HealthRecord {
    id: number;
    cat_id: number;
    date: string;
    description: string;
    vet_name: string;
  }

export interface ExaminationRequest {
    id: number;
    cat_id: number;
    caregiver_id: number;
    cat_name: string;
    caregiver_name: string;
    request_date: string;
    description: string;
    status: number;
  }

  export enum Status {
    PENDING = 0,
    APPROVED = 1,
    REJECTED = 2,
    COMPLETED = 3,
    IN_PROGRESS = 4,
    CANCELED = 5,
  }