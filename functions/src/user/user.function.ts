import * as functions from "firebase-functions/v2";
import {Timestamp, FieldValue, DocumentData,
  CollectionReference, Query} from "firebase-admin/firestore";
import {corsHandler, db} from "../index";

const fvServerTimeStamp: FieldValue = FieldValue.serverTimestamp();
functions.setGlobalOptions({region: "europe-west1"});

export interface User {
    id: string;
    name: string;
    role: string;
    enabled: boolean;
    date: Timestamp;
}

export const addUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const {name, role} = req.body;
    try {
      const docRef = await db.collection("users").add({
        name,
        role,
        date: fvServerTimeStamp,
        enabled: true,
        nameLower: name.toLowerCase(),
        roleLower: role.toLowerCase(),
      });
      console.log("Document written with ID: ", docRef.id);
      res.json({message: "Document written with ID: " + docRef.id});
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).send("Error adding user");
    }
  });
});

export const getUsers = functions.https.onRequest({}, async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const querySnapshot = await db.collection("users").get();
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({id: doc.id, ...doc.data()} as unknown as User);
      });
      res.json(users);
    } catch (error) {
      console.error("Error retrieving users:", error);
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
          date: fvServerTimeStamp,
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
    const {name, role} = req.query;

    try {
      const collectionRef = db.collection("users");

      let query: Query<DocumentData>
      | CollectionReference<DocumentData> = collectionRef;

      if (name) {
        const nameLower = (name as string).toLowerCase();
        const nameStart = nameLower;
        const nameEnd = nameLower + "\uf8ff";
        query = query
          .where("nameLower", ">=", nameStart)
          .where("nameLower", "<=", nameEnd);
      }

      if (role) {
        const roleLower = (role as string).toLowerCase();
        const roleStart = roleLower;
        const roleEnd = roleLower + "\uf8ff";
        query = query
          .where("roleLower", ">=", roleStart)
          .where("roleLower", "<=", roleEnd);
      }

      const querySnapshot = await query.get();
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({...doc.data() as User});
      });

      res.json(users);
    } catch (error) {
      console.error("Error searching for users:", error);
      res.status(500).send("Error searching for users");
    }
  });
});
