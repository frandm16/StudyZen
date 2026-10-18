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
    hasPassword: boolean;
    hasGoogleIdentity: boolean;
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
