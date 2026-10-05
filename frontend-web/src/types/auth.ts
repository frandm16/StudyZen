export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends AuthCredentials {
    displayName: string;
}

export interface User {
    id: number;
    email: string;
    displayName: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileDTO {
    displayName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}
