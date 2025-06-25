# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-06-25 10:27:14 - Initial creation from projectBrief.md.

*

## Project Goal

HappeningRoulette.com is an innovative platform for ephemeral art events at specific geographic locations. The platform enables users to share live content (text, images, videos) and chat in real time within a defined event area (geofence), fostering and documenting spontaneous, location-based art happenings.

## Key Features

* Geofenced Events: Events are bound to a specific location and radius. Content can only be posted by users within this area.
* Interactive Map: A Leaflet map visualizes the event area and the user's current position.
* Live Content Sharing: Users can share text messages, images, and videos in real time.
* Real-Time Chat: Direct communication between event participants.
* Event Archive: Past events and their content are accessible.
* User Authentication: Secure access and attribution of content to users.

## Overall Architecture

* Frontend: Next.js (React), Leaflet for maps, Tailwind CSS for styling, next-mdx-remote for static content.
* Backend & Database: Supabase (PostgreSQL, Realtime, Storage, Auth).
* Geofencing: Turf.js (via [`lib/useIsInside.ts`](lib/useIsInside.ts)).
* API: Next.js API Routes (Serverless Functions).
* Data Model: 
  * `events` (event info, geodata, time)
  * `posts` (media, text, event/user ref)
  * `chats` (messages, event/user ref)

---