import React, { useState, useEffect, Fragment } from "react";
import { GiWaterFlask, GiWaterDrop } from "react-icons/gi";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import Modal from "./modal";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const REACT_APP_FIREBASE_API_KEY = "AIzaSyDqnqAk1YRwk_LenAFeYJiTt48GwIvxerQ";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: "ucare-e7783.firebaseapp.com",
  projectId: "ucare-e7783",
  storageBucket: "ucare-e7783.appspot.com",
  messagingSenderId: "116550458500",
  appId: "1:116550458500:web:7a19a6d2ecb1598e0ab6d1",
  measurementId: "G-WFL84B5GCW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();
const Options = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [remember, setRemember] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [drinked, setDrinked] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["user"], function (result) {
      // console.log("Value currently is " + JSON.stringify(result));
      const unsub = onSnapshot(
        doc(db, "users", result.user.uid),
        { includeMetadataChanges: true },
        async (doc) => {
          const drinkedList = (await doc.data().drinks) || [];
          console.log("Drinked", drinkedList);
          chrome.storage.local.set({ drinked: drinkedList });
        }
      );
      setUser(result.user);
    });
    chrome.storage.local.get(["drinked"], function (result) {
      const drinked = result.drinked || [];
      setDrinked(drinked);
    });

    chrome.storage.onChanged.addListener(async (changes, namespace) => {
      for (var key in changes) {
        var storageChange = changes[key];
        if (key === "drinked") {
          const drinks = storageChange.newValue;
          setDrinked(drinks);
          // Sync data with uid and firebase
          const user = await chrome.storage.local.get(["user"]);
          const uid = user.user.uid;
          const docRef = doc(db, "users", uid);
          // Get doc
          await setDoc(docRef, { drinks });

          console.log("Synced to cloud!");
          // const docSnap = await getDoc(docRef);
          // if (docSnap.exists()) {
          //   // Update doc
          //   await setDoc(docRef, { drinked });
          // }
        }
      }
    });

    chrome.storage.local.get(["timeToDrink"], function (result) {
      if (result.timeToDrink === true) {
        setShowModal(true);
        chrome.storage.local.set({ timeToDrink: false });
      }
    });
    setIsMenuOpen(false);
    // Get user from chromestorage.sync
  }, []);

  const handleLoginForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
      const user = userCredential.user;
      setUser(user);

      // save user to chrome.storage.sync
      const current = await chrome.storage.local.set({ user });
      console.log(current);
      setIsLoading(false);
      // ...
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError("Email or password is incorrect");
      setIsLoading(false);
    }
  };
  return user ? (
    <Fragment>
      <Modal
        showModal={showModal}
        setShowModal={(value) => {
          setShowModal(value);
        }}
      />
      <nav className="flex gap-2 items-center justify-between relative fixed py-4 bg-gray-900 px-4">
        <div className="w-full  flex flex-wrap items-center justify-between mx-auto p-4 ml-4 mr-4">
          {
            // <div className="left-[-5px] rounded-full w-10 h-10 bg-gradient-to-r from-emerald-400 to-sky-500  absolute z-[-10] "></div>
          }
          <div className="font-bold relative hover:cursor-pointer">
            <h1 className="text-3xl text-white z-[100] ">WhaleCare</h1>
            <div className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-none rounded-full  top-0 absolute  z-[0] right-[-10px] blur-4 drop-filter-blur">
              <sup className="font-extrabold text-transparent  bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-600 text-3xl">
                +
              </sup>
            </div>
          </div>

          <div className="flex gap-8 justify-center items-center p-1 rounded-full">
            <div className="flex gap-8 text-xl">
              <a
                // onClick={() => setIsMenuOpen(false)}
                className="hover:cursor-pointer hover:text-sky-500 font-semibold text-white"
              >
                Dashboard
              </a>
            </div>
            <div className="relative">
              {user ? (
                <Fragment>
                  <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="hover:cursor-pointer hover:bg-gray-200  p-1 rounded-full"
                  >
                    {user.photoURL ? (
                      <img
                        className="h-10 w-10 hover:cursor-pointer hover:bg-gray-200 rounded-full"
                        src={user.photoURL}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 hover:cursor-pointer hover:bg-gray-200 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white text-xl font-bold">
                        {"W"}
                        {}
                      </div>
                    )}
                  </div>
                  <div
                    className={`z-50 right-[40px] md:right-[0px] my-4 text-base list-none divide-y rounded-lg shadow bg-gray-700 divide-gray-600 ${
                      isMenuOpen ? "" : "hidden"
                    } absolute`}
                  >
                    <div className="px-4 py-3">
                      <span className="block text-sm text-white">
                        {user.name}
                      </span>
                      <span className="block text-sm truncate text-gray-400">
                        {user.email}
                      </span>
                    </div>
                    <ul className="py-2" aria-labelledby="user-menu-button">
                      <li>
                        <a className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white">
                          Profile
                        </a>
                      </li>
                      <li>
                        <a className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white">
                          Settings
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => {
                            signOut(getAuth());
                            setIsMenuOpen(false);
                            setUser(null);
                            chrome.storage.local.set({ user: null });
                          }}
                          className="cursor-pointer block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
                        >
                          Sign out
                        </a>
                      </li>
                    </ul>
                  </div>
                </Fragment>
              ) : (
                <div className="flex gap-2 items-center justify-center">
                  <button className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-200 hover:text-blue-700">
                    Sign in
                  </button>
                  <button className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-200 hover:text-blue-700">
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="flex flex-col">
        <div className="flex w-full bg-gradient-to-r from-sky-500 to-emerald-400  justify-center text-4xl py-4 font-bold text-white">
          WhaleWater
        </div>

        <div className="grid m-4 items-center justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              className="hover:bg-sky-200 cursor-pointer  max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center flex-col"
              onClick={() => setShowModal(true)}
            >
              <div className="w-10 h-10 relative">
                <p className="absolute top-50 right-50 font-bold text-2xl flex gap-1">
                  <GiWaterFlask className="text-orange-400 w-10 h-10" />
                  <span>+</span>
                </p>
              </div>
              <p>Add water</p>
            </div>
            {drinked
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(({ amount, type, unit, timestamp }) => (
                <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex gap-2 flex-col items-center justify-center ">
                  <div className="w-10 h-10 drop-shadow-lg rounded-full">
                    <GiWaterDrop
                      className={`text-sky-400 ${
                        type === "glass"
                          ? "w-10 h-10"
                          : type === "cup"
                          ? "w-8 h-8 "
                          : "w-6 h-6"
                      }`}
                    />
                  </div>
                  <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">
                    {amount} {unit}
                  </p>
                  {timestamp && (
                    <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">
                      {new Date(timestamp).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </p>
                  )}
                  <a
                    href="#"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    Remove
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                    </svg>
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Fragment>
  ) : (
    <div className="flex h-[100vh] w-[100vw]">
      <div className="flex w-[100vw] flex-col items-center justify-center px-6 py-8 mx-auto md:h-auto !pt-28 !pb-28 lg:py-0 bg-gradient-to-r from-emerald-500 to-sky-400">
        <div className="w-[100vw] bg-white bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl ">
              Sign in to your account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={(e) => handleLoginForm(e)}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-white "
                >
                  Your email
                </label>
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300  sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-white "
                >
                  Password
                </label>
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300  sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                  required
                />
              </div>
              {<div className="text-red-500 text-sm">{error ? error : ""}</div>}
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      onChange={(e) => setRemember(e.target.checked)}
                      id="remember"
                      checked={remember}
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 "
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-white">
                      Remember me
                    </label>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-primary-600 hover:underline "
                >
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 flex justify-center items-center "
              >
                {isLoading ? (
                  <div role="status" className="flex justify-center w-full">
                    <svg
                      aria-hidden="true"
                      className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
