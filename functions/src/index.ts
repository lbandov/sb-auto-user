// In index.ts
import * as userCrudFunctions from "./user/user.function";
import * as userSearchFunctions from "./user/searchusers.function";
import {getFirestore, Firestore} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
import * as cors from "cors";

initializeApp();
const corsOptionsDelegate: cors.CorsOptionsDelegate = (req, callback) => {
  callback(null, {origin: true});/*
  const allowedOrigins = ["https://sb-auto-user-manager.web.app"];
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    callback(null, {origin: true});
  } else {
    callback(null, {origin: false});
  }*/
};
export const corsHandler = cors(corsOptionsDelegate);

export const db: Firestore = getFirestore();

/** User sectopm*/
export const {addUser, getUsers, updateUser, deleteUser} = userCrudFunctions;
export const {searchUsers} = userSearchFunctions;

