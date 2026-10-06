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
    username?: string;
    bio?: string;
    avatarUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileDTO {
    displayName?: string;
    username?: string;
    bio?: string;
    email?: string;
    avatarUrl?: string;
    currentPassword?: string;
    newPassword?: string;
}
