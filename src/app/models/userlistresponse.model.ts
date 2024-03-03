import { User } from "./user.model";

export interface UserListResponse {
    users: User[];
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
} 