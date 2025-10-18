# Go-Track: Real-Time Crypto Price Alert System

![Go Version](https://img.shields.io/badge/go-1.21-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.7x-blue)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Go-Track is a full-stack, event-driven application that allows users to set price alerts for cryptocurrencies and receive instant push notifications on their mobile device when the target price is met.

This project was built to demonstrate a complete, event-driven system architecture, combining a high-performance **Golang** backend (for data ingestion and API) with a native mobile frontend built in **React Native**.

## Features

* **Secure User Authentication:** JWT-based registration and login for the mobile app.
* **Real-Time Price Alerts:** Set price targets for various coins (e.g., `BTC > $70,000`).
* **Push Notifications (WIP):** Designed to send instant alerts via Firebase Cloud Messaging (FCM) when a price target is hit.
* **Live Data Ingestion (Mocked):** The backend is built to connect to a live crypto exchange WebSocket feed (e.g., Coinbase, Binance) for zero-latency price data.
* **Alert Management:** Users can add and view their active alerts from the mobile app.

## Tech Stack

This project is a monorepo containing two main parts:

### Backend (Go)
* **Go (Golang):** For the core API and business logic.
* **Gin:** A fast, lightweight HTTP web framework for the REST API.
* **golang-jwt/jwt:** For generating and validating JWT tokens.
* **gorilla/websocket (Planned):** For connecting to live exchange data feeds.
* **PostgreSQL (Planned):** As the persistent database for users and alerts. (Currently uses an in-memory map).
* **Docker:** The backend is containerized for easy deployment.

### Frontend (React Native)
* **React Native:** For a cross-platform (iOS/Android) mobile application.
* **Axios:** For making requests to the Go backend API.
* **@react-native-async-storage/async-storage:** For securely storing the user's JWT on the device.
* **@react-native-firebase/messaging (Planned):** For receiving push notifications.

## Getting Started

### Prerequisites

* [Go (1.21+ an up)](https://go.dev/doc/install)
* [Node.js (LTS, 18 or 20)](https://nodejs.org/) & `npm`
* [React Native CLI environment](https://reactnative.dev/docs/environment-setup) (including JDK 17, Android Studio / Xcode).
* An Android Emulator or physical device.

### 1. Run the Backend (Go)

1.  Open a terminal in the `backend` folder:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    go mod tidy
    ```

3.  Run the server. It will start on `http://localhost:8080`.
    ```bash
    go run main.go
    ```

### 2. Run the Frontend (React Native)

1.  In a **separate terminal**, navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```

2.  Install all `npm` dependencies:
    ```bash
    npm install
    ```

3.  Run the app on your connected device or emulator:
    ```bash
    # For Android
    npx react-native run-android

    # For iOS (macOS only)
    npx react-native run-ios
    ```

The app should now open, and you can register a new user and log in.
