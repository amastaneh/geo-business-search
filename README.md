# Geo Business Search

Geo Business Search is a simple single-page web app built with **Next.js 14 (App Router)** and **JavaScript**.  
It follows the **BYOT = Bring Your Own Token** approach, where every user provides their own **Google Maps API Key** to use the app.  

The app lets users search for businesses within a specific geographic area using Google Places API.  
Results are shown in a clean, responsive **Tailwind CSS** table.

---

## Features
- Enter your **Google Maps API Key**, latitude, longitude, radius (meters), and keyword.
- Send a search request to the backend API route: `/api/places`.
- Backend calls **Google Places API** using **axios** with error handling and timeout.
- Normalized response is returned with key details: **Name, Address, Phone**.
- Results displayed in a responsive **Tailwind CSS table**.
- Supports **Next Page** button when `nextPageToken` exists.
- Input validation for API Key, latitude, longitude, radius, and keyword.
- UI states for **loading**, **error**, and **empty results**.

---

## Tech Stack
- **Next.js 14 (App Router)**
- **JavaScript**
- **Tailwind CSS** (for UI)
- **Axios** (for server-side API calls)

---

## How It Works
1. User fills the form with:
   - Google Maps API Key (required)  
   - Latitude, Longitude (required)  
   - Radius in meters (required)  
   - Keyword (optional)  

2. Click **Search** button → sends POST request to `/api/places`.  
3. Backend uses **axios** to call **Google Places API** with given parameters.  
4. Results are normalized and returned to frontend.  
5. Frontend displays results in a table.  
6. If more results available, **Next Page** button fetches the next set.

---

## Security
- API Key is provided by user and is not stored, logged, or shared.  
- Key is only used for the current server request.  
- Users are responsible for their own API usage and costs.

---

## Project Structure
```
/app
/api
/places/route.js # Backend API route
/page.jsx # Main page with form and table
/lib
places.js # Helper functions for normalization
```

---

## Acceptance Criteria
- User can search businesses with their own Google Maps API Key.  
- Results displayed in a responsive table with Name, Address, Phone.  
- Supports pagination with **Next Page**.  
- Input validation and error states included.  
- Smooth user experience with Tailwind.

---

## License
This project is open-source and free to use.
