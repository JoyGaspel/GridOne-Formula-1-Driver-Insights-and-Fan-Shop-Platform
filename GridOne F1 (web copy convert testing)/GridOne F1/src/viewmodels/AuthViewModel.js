import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../api/firebase";

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);