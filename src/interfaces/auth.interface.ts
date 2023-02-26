export interface SignUpData {
    email: string;
    password: string;
    role: 'ADMIN' | 'SUBSCRIBER';
}

export interface LogInData {
    email: string;
    password: string;
}

export interface TokenData {
    token: string;
    expiresIn: number;
}

export interface DataStoredInToken {
    id: number;
}
