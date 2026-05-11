# E-Commerce Application

A full-stack e-commerce application with Spring Boot backend and React.js frontend.

## Features
- Product listing with card/grid view
- Product details: image, name, short description, full description, and price
- Static data stored in HashMap (local database)
- Responsive design with grid and list view options
- Beautiful gradient UI with hover effects

## Project Structure
```
ecommerce/
├── src/main/java/com/vivriti/ecommerce/    # Spring Boot backend
│   ├── model/Product.java                   # Product model
│   └── controller/ProductController.java    # REST API endpoints
└── frontend/                                # React.js frontend
    └── src/
        ├── App.js                           # Main application component
        ├── ProductCard.js                   # Product card component
        └── *.css                            # Styling files
```

## How to Run

### Backend (Spring Boot)
1. Open terminal in the project root directory
2. Run: `./gradlew bootRun` (Linux/Mac) or `gradlew.bat bootRun` (Windows)
3. Backend will start on `http://localhost:8080`

### Frontend (React)
1. Open a new terminal
2. Navigate to frontend directory: `cd frontend`
3. Install dependencies (first time only): `npm install`
4. Start React app: `npm start`
5. Frontend will open at `http://localhost:3000`

## API Endpoints
- `GET /api/products` - Fetch all products
- `GET /api/products/{id}` - Fetch single product by ID

## Technologies Used
- **Backend**: Spring Boot 4.0.2, Java 18
- **Frontend**: React.js
- **Data Storage**: HashMap (in-memory)
- **Styling**: CSS3 with gradients and animations
