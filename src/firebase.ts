import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBJekZSYsBHxbyEFPZQuUGh04oonCK_4pI",
  authDomain: "planning-poker-bo.firebaseapp.com",
  databaseURL: "https://planning-poker-bo-default-rtdb.firebaseio.com",
  projectId: "planning-poker-bo",
  storageBucket: "planning-poker-bo.firebasestorage.app",
  messagingSenderId: "910144414387",
  appId: "1:910144414387:web:cecb10f01a196da22246c6"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
