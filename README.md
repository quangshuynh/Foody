# 🍔 Foody 🍕

**Foody** is a React application for keeping track of restaurant visits, building a food bucket list, sharing ratings and comments, and exploring nearby recommendations on a map.

[![CI](https://github.com/quangshuynh/foody/actions/workflows/ci.yml/badge.svg)](https://github.com/quangshuynh/foody/actions/workflows/ci.yml) ![Tests](https://img.shields.io/badge/tests-15%20passing-brightgreen) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](MIT_LICENSE)

> Life is uncertain. Eat dessert first... but track it in Foody! 🍰

## 🌮 What's Cooking?

With Foody, you can:

- Track visited restaurants, including ratings, comments, tags, and addresses
- Build and maintain a list of restaurants to visit
- Search visited restaurants by name
- Choose how many visited and to-visit entries are displayed
- Find nearby restaurant recommendations by ZIP code, radius, and cuisine
- View visited, to-visit, and recommended restaurants on an interactive map
- Open restaurant addresses in Google Maps or copy them to the clipboard
- Browse public restaurant data as a guest and sign in to make changes

## 🥑 Key Features

### 🍽️ Visited Restaurants

- Add, edit, and remove restaurants while authenticated
- Submit a rating, return preference, and optional comment
- View average ratings and comments from other users
- Organize restaurants with configurable tags

### 🍣 Restaurants to Visit

- Build a food bucket list with restaurant names, addresses, map coordinates, and tags
- Edit or remove entries while authenticated
- Jump from an entry to its map location

### 🍗 Nearby Recommendations

- Query OpenStreetMap data by ZIP code, search radius, and cuisine
- Randomize up to five matching results
- Fall back to the Rochester, New York area when ZIP-code lookup fails

### 🗺️ Interactive Map

- Display visited, to-visit, and recommended restaurants with distinct markers
- Focus the map on a selected restaurant
- Open addresses in Google Maps
- Use OpenStreetMap tiles through React Leaflet

### 👤 Accounts and Guest Access

- Register and sign in with Firebase Authentication
- Store user profiles and restaurant data in Cloud Firestore
- Browse restaurant lists and the map without signing in
- Restrict data-changing controls to authenticated users

## 🍳 Technical Ingredients

- **React** and **Create React App**
- **Styled Components**
- **React Leaflet**, **Leaflet**, and **OpenStreetMap**
- **Firebase Authentication** and **Cloud Firestore**
- **Nominatim** for address geocoding
- **Zippopotam.us** for ZIP-code coordinates
- **Overpass API** for nearby restaurant recommendations
- **Context API** for authentication and map-focus state
- **Jest** and **React Testing Library** for automated tests

Foody is a client-side application. It does not currently include an Express server or use file-based storage for live application data.

## 🥞 Installation and Setup

1. Clone the repository and install its locked dependencies:

   ```bash
   git clone https://github.com/quangshuynh/foody.git
   cd foody
   npm ci
   ```

2. Create a `.env.local` file with your Firebase web-app configuration:

   ```dotenv
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   Firebase web configuration identifies your Firebase project; access control must still be enforced with Firebase Authentication and Firestore Security Rules. Environment files are ignored by Git—do not commit private credentials or service-account keys.

3. Start the development server:

   ```bash
   npm start
   ```

4. Open `http://localhost:3000`.

## 🧪 Tests

Run the complete non-interactive test suite with:

```bash
npm test -- --watchAll=false --runInBand
```

The tests mock Firebase and external geocoding boundaries, so they do not require credentials or network access.

## 🍇 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 🥓 License

This project is licensed under the [MIT License](MIT_LICENSE).

## 🍪 Acknowledgments

- Thanks to all the restaurants that inspired this app
- Special thanks to the open-source community for the amazing tools
- And to all the foodies out there - bon appétit!
