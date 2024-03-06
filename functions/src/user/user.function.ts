import * as functions from "firebase-functions/v2";
import {FieldValue} from "firebase-admin/firestore";
import {corsHandler, db} from "../index";
import {User} from "../models/user.model";

functions.setGlobalOptions({region: "europe-west1"});
export const addUser = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const {name, role, enabled} = req.body;
    const trimName = name.trim();
    const trimRole = role.trim();

    if (isUserInvalid(trimName, trimRole)) {
      res.status(400).send("Please supply a name and a role for the user");
      return;
    }
    try {
      const docRef = await db.collection("users").add({
        name: trimName,
        role: trimRole,
        date: FieldValue.serverTimestamp(),
        enabled,
        nameLower: trimName.toLowerCase(),
        roleLower: trimRole.toLowerCase(),
      });
      res.json({message: "Document written with ID: " + docRef.id});
    } catch (error) {
      res.status(500).send("Error adding user");
    }
  });
});

export const getUsers = functions.https.onRequest({}, async (req, res) => {
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
      const userRef = db.collection("users").doc(id);
      const doc = await userRef.get();

      if (!doc.exists) {
        res.status(404).send("User not found");
        return;
      }

      const trimName = name.trim();
      const trimRole = role.trim();

      if (isUserInvalid(trimName, trimRole)) {
        res.status(400).send("Please supply a name and a role for the user");
        return;
      }

      const currentUser = doc.data() as User;
      const isDifferent = name !== currentUser.name ||
      role !== currentUser.role ||
      enabled !== currentUser.enabled;

      if (isDifferent) {
        await userRef.set({
          name: trimName,
          role: trimRole,
          enabled,
          nameLower: trimName.toLowerCase(),
          roleLower: trimRole.toLowerCase(),
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

const isUserInvalid = (name: string, role: string): boolean => {
  return (!name && !role);
};
