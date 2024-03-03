// In index.ts
import * as userFunctions from "./user/user.function";
import {getFirestore, Firestore} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
import * as corsLib from "cors";

initializeApp();

export const corsHandler = corsLib({origin: true});

export const db: Firestore = getFirestore();

export const {addUser, getUsers, updateUser,
  deleteUser, searchUsers} = userFunctions;
