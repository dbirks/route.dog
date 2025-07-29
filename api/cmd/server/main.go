package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"route.dog/api/internal/handler"
	"route.dog/api/internal/service"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize services
	openaiService, err := service.NewOpenAIService()
	if err != nil {
		log.Fatalf("Failed to initialize OpenAI service: %v", err)
	}

	geocodingService := service.NewGeocodingService()

	// Initialize handlers
	addressHandler := handler.NewAddressHandler(openaiService, geocodingService)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	// Routes
	r.Route("/v1", func(r chi.Router) {
		r.Post("/addresses", addressHandler.ParseAddresses)
	})

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origins := os.Getenv("CORS_ORIGINS")
		if origins == "" {
			origins = "http://localhost:3000,http://localhost:5173"
		}

		w.Header().Set("Access-Control-Allow-Origin", "*") // For development
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}