export interface DecodedJWT {
    role: string;
}

export enum Role {
    UNAUTHORIZED = -1,
    ADMIN = 0,
    USER = 1,
}