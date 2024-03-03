// In index.ts
import * as userFunctions from "./user/user.function";
import {getFirestore, Firestore} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
import * as cors from "cors";

initializeApp();

const corsOptionsDelegate: cors.CorsOptionsDelegate = (req, callback) => {
  const allowedOrigins = ["https://sb-auto-user-manager.web.app"];
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    callback(null, {origin: true});
  } else {
    callback(null, {origin: false});
  }
};
export const corsHandler = cors(corsOptionsDelegate);

export const db: Firestore = getFirestore();

export const {addUser, getUsers, updateUser,
  deleteUser, searchUsers} = userFunctions;
