# Backend Implementation Guidance: User Authentication & Data Storage

This document outlines the steps to implement a proper backend for the Web Ledger Lite application, focusing on user authentication (email/password) and user-specific data storage using Firebase. Currently, the application mocks user-specific data using `localStorage`.

## 1. Firebase Project Setup

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project or use an existing one.
2.  **Add Firebase to your Web App:** In your Firebase project, add a web app and copy the Firebase configuration object. You'll use this to initialize Firebase in your Next.js application.
    ```javascript
    // Example firebaseConfig
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```
3.  **Install Firebase SDK:**
    ```bash
    npm install firebase
    # or
    yarn add firebase
    ```

## 2. Firebase Authentication Setup

1.  **Enable Email/Password Authentication:** In the Firebase Console, navigate to "Authentication" -> "Sign-in method" and enable the "Email/Password" provider.
2.  **Initialize Firebase Auth:** Create a Firebase initialization file (e.g., `src/lib/firebase.ts` or integrate into `src/ai/genkit.ts` if appropriate for your structure, though typically Firebase client SDK init is separate from Genkit server-side).

    ```typescript
    // src/lib/firebase.ts
    import { initializeApp, getApp, getApps } from 'firebase/app';
    import { getAuth } from 'firebase/auth';

    const firebaseConfig = {
      // ... your firebaseConfig object ...
    };

    // Initialize Firebase
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);

    export { app, auth };
    ```

## 3. Backend API Endpoints (Next.js API Routes or Server Actions)

You'll need API endpoints to handle user registration, login, and data operations. Next.js API Routes (e.g., in `src/app/api/...`) or Server Actions are suitable for this.

### 3.1. Authentication Endpoints

*   **`POST /api/auth/signup`**:
    *   Accepts `email` and `password`.
    *   Uses `firebase/auth` `createUserWithEmailAndPassword` function.
    *   **Crucially, Firebase handles password hashing automatically and securely.**
    *   Returns user information or a success message.
*   **`POST /api/auth/login`**:
    *   Accepts `email` and `password`.
    *   Uses `firebase/auth` `signInWithEmailAndPassword` function.
    *   On success, Firebase manages the session. You can get the user's ID token to send to your client if needed for custom backend verification, or rely on Firebase's client-side session management.
*   **`POST /api/auth/logout`**:
    *   Uses `firebase/auth` `signOut` function.

### 3.2. Data Endpoints (Authenticated)

These endpoints will interact with Firestore to save/load data for the authenticated user.

*   **`GET /api/data/transactions`**:
    *   Requires authentication (check Firebase user session on the server-side or validate ID token).
    *   Fetches transactions from Firestore for the current `uid`.
*   **`POST /api/data/transactions`**:
    *   Requires authentication.
    *   Saves a new transaction to Firestore under the current `uid`.
*   Similar endpoints for `fixed-costs`:
    *   `GET /api/data/fixed-costs`
    *   `POST /api/data/fixed-costs`
    *   `DELETE /api/data/fixed-costs/:id`

## 4. Firestore Database Setup

1.  **Enable Firestore:** In the Firebase Console, go to "Firestore Database" and create a database. Start in "test mode" for easy development, but **configure security rules before production.**
2.  **Data Structure:** Plan your Firestore data structure. A common approach:
    *   A top-level collection `users`. Each document ID is the Firebase `uid`.
        *   `users/{uid}/transactions/{transactionId}`
        *   `users/{uid}/fixedCosts/{fixedCostId}`

3.  **Security Rules:** Essential for protecting user data. Ensure users can only read/write their own data.
    Example Firestore security rules (`firestore.rules`):
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow users to read and write only their own data
        match /users/{userId}/{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

## 5. Frontend Integration

1.  **Update `LoginForm.tsx`**:
    *   Call your `/api/auth/login` endpoint instead of the mock logic.
    *   On successful login, Firebase SDK will automatically manage the user's session client-side. You can use `onAuthStateChanged` listener from `firebase/auth` to react to login/logout state changes globally.
2.  **User Context/Global State:**
    *   Use React Context or a state management library to provide the current Firebase user (`auth.currentUser`) and authentication status throughout your app. This will replace the `isLoggedIn` and `userId` in `localStorage`.
3.  **Refactor Data Hooks (`useLedger.ts`, `useFixedCosts.ts`):**
    *   Remove `localStorage` logic.
    *   Accept the Firebase `uid` (user ID) as a parameter.
    *   Use `fetch` or a library like React Query (already in dependencies) to make authenticated requests to your backend API endpoints.
    *   Send the Firebase ID token in the `Authorization` header (`Bearer <ID_TOKEN>`) if your backend API needs to verify it. Firebase Admin SDK on the server can verify these tokens.
4.  **Authentication Guard / Protected Routes:**
    *   Ensure that the `/dashboard` page is only accessible to authenticated users. Redirect unauthenticated users to the login page. The `onAuthStateChanged` listener is key here.

## Password Hashing

*   **Firebase Authentication handles password hashing automatically and securely** when you use `createUserWithEmailAndPassword`. You do not need to implement hashing (e.g., with bcrypt) yourself for user passwords if using Firebase Auth.
*   If you were building a custom authentication system *without* Firebase Auth, you would need to:
    *   Use a strong hashing algorithm like bcrypt or Argon2 on the server-side.
    *   Store the hashed password in your database.
    *   During login, hash the provided password and compare it with the stored hash.
    *   **Never store plain-text passwords.**

## Configuration Summary

To implement this, you need to:

1.  **Configure Firebase:**
    *   Create a Firebase project.
    *   Enable Authentication (Email/Password).
    *   Set up Firestore and define security rules.
    *   Add Firebase SDK configuration to your Next.js app.
2.  **Develop Backend Logic:**
    *   Create API routes or Server Actions for signup, login, logout.
    *   Create API routes or Server Actions for CRUD operations on transactions and fixed costs, ensuring they are authenticated and operate on the correct user's data in Firestore.
3.  **Update Frontend Logic:**
    *   Integrate Firebase Auth SDK for login/logout and session management.
    *   Modify data fetching hooks to use your new backend APIs instead of `localStorage`.
    *   Protect routes that require authentication.

This is a significant undertaking but provides a robust and scalable solution for user authentication and data management. The current application provides a good starting point for the UI and client-side logic structure.
