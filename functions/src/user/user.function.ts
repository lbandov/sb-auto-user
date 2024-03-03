import * as functions from "firebase-functions/v2";
import {FieldValue, DocumentData,
  Query} from "firebase-admin/firestore";
import {corsHandler, db} from "../index";
import {User} from "../models/user.model";

const fvServerTimeStamp: FieldValue = FieldValue.serverTimestamp();
functions.setGlobalOptions({region: "europe-west1"});

export const addUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const {name, role, enabled} = req.body;
    try {
      const docRef = await db.collection("users").add({
        name,
        role,
        date: fvServerTimeStamp,
        enabled,
        nameLower: name.toLowerCase(),
        roleLower: role.toLowerCase(),
      });
      res.json({message: "Document written with ID: " + docRef.id});
    } catch (error) {
      res.status(500).send("Error adding user");
    }
  });
});

export const getUsers = functions.https.onRequest({}, async (req, res) => {
  functions.logger.info("Origin:", req.headers.origin);
  corsHandler(req, res, async () => {
    try {
      const querySnapshot = await db.collection("users")
        .orderBy("date", "asc").get();
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({id: doc.id, ...doc.data()} as User);
      });
      res.json(users);
    } catch (error) {
      res.status(500).send("Error retrieving users");
    }
  });
});

export const updateUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const {id, name, role, enabled} = req.body as User;

    try {
    // Fetch the current user document
      const userRef = db.collection("users").doc(id);
      const doc = await userRef.get();

      if (!doc.exists) {
        res.status(404).send("User not found");
        return;
      }

      const currentUser = doc.data() as User;
      const isDifferent = name !== currentUser.name ||
      role !== currentUser.role ||
      enabled !== currentUser.enabled;

      if (isDifferent) {
      // Only update if there's a difference
        await userRef.set({
          name,
          role,
          enabled,
          nameLower: name?.toLowerCase(),
          roleLower: role?.toLowerCase(),
        }, {merge: true});
        res.send("User updated");
      } else {
      // If there's no difference, inform the requester
        res.send("User data is the same.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).send("Error updating user");
    }
  });
});

export const deleteUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const {id} = req.body;
    try {
      await db.collection("users").doc(id).delete();
      res.send("User deleted");
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Error deleting user");
    }
  });
});

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
