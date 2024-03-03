import {Timestamp} from "firebase-admin/firestore";

export interface User {
    id: string;
    name: string;
    role: string;
    enabled: boolean;
    date: Timestamp;
    nameLower: string;
    roleLower: string;
}
