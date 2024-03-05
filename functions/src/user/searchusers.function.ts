import * as functions from "firebase-functions/v2";
import {DocumentData, Query} from "firebase-admin/firestore";
import {User} from "../models/user.model";
import {corsHandler, db} from "..";

export const searchUsers = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const {name, role, status} = req.query;

    try {
      const collectionRef = db.collection("users");

      let query: Query<DocumentData> = collectionRef;
      if (name) {
        const nameLower = (name as string).toLowerCase();
        const nameStart = nameLower;
        const nameEnd = nameLower + "\uf8ff";
        query = query
          .where("nameLower", ">=", nameStart)
          .where("nameLower", "<=", nameEnd);
      }

      if (!name && role) {
        const roleLower = (role as string).toLowerCase();
        const roleStart = roleLower;
        const roleEnd = roleLower + "\uf8ff";
        query = query
          .where("roleLower", ">=", roleStart)
          .where("roleLower", "<=", roleEnd);
      }

      const querySnapshot = await query.get();
      let users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({id: doc.id, ...doc.data()} as User);
      });

      if (name && role) {
        users = users.filter((user) =>
          user.roleLower.includes((role as string).toLowerCase()));
      }
      const parsedStatus = parseInt(status as string);
      if (parsedStatus>0) {
        users = users.filter((user) =>
          user.enabled === (parsedStatus === 1));
      }

      res.json(users);
    } catch (error) {
      console.error("Error searching for users:", error);
      res.status(500).send("Error searching for users");
    }
  });
});
