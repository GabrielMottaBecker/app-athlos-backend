export interface AuthenticatedUser {
    sub: string;
    email: string;
    atleticaId: string;
    permissions: string[];
}
