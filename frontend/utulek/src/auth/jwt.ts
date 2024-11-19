export interface DecodedJWT {
    role: string;
}

export enum Role {
    UNAUTHORIZED = -1,
    ADMIN = 0,
    VOLUNTEER = 1,
    VETS = 2,
    CAREGIVER = 3,
}