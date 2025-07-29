package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type Address struct {
	Original     string  `json:"original"`
	Standardized string  `json:"standardized"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}

type ParseAddressesRequest struct {
	Image string `json:"image"` // base64 encoded image
}

type ParseAddressesResponse struct {
	Addresses []Address `json:"addresses"`
	Error     string    `json:"error,omitempty"`
}

type GeocodeResult struct {
	Result struct {
		AddressMatches []struct {
			MatchedAddress string `json:"matchedAddress"`
			Coordinates    struct {
				X float64 `json:"x"` // longitude
				Y float64 `json:"y"` // latitude
			} `json:"coordinates"`
		} `json:"addressMatches"`
	} `json:"result"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	// Routes
	r.Route("/v1", func(r chi.Router) {
		r.Post("/addresses", handleParseAddresses)
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

func handleParseAddresses(w http.ResponseWriter, r *http.Request) {
	var req ParseAddressesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if req.Image == "" {
		respondWithError(w, http.StatusBadRequest, "Image is required")
		return
	}

	// Extract addresses from image using OpenAI Vision
	addresses, err := extractAddressesFromImage(req.Image)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to extract addresses: %v", err))
		return
	}

	// Geocode each address
	var geocodedAddresses []Address
	for _, addr := range addresses {
		geocoded, err := geocodeAddress(addr)
		if err != nil {
			log.Printf("Failed to geocode address '%s': %v", addr, err)
			// Still include the address but without coordinates
			geocodedAddresses = append(geocodedAddresses, Address{
				Original:     addr,
				Standardized: addr,
				Latitude:     0,
				Longitude:    0,
			})
		} else {
			geocodedAddresses = append(geocodedAddresses, geocoded)
		}
	}

	response := ParseAddressesResponse{
		Addresses: geocodedAddresses,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func extractAddressesFromImage(imageBase64 string) ([]string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY not set")
	}

	client := openai.NewClient(option.WithAPIKey(apiKey))

	// Remove data URL prefix if present
	if strings.HasPrefix(imageBase64, "data:image/") {
		parts := strings.Split(imageBase64, ",")
		if len(parts) > 1 {
			imageBase64 = parts[1]
		}
	}

	response, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Model: openai.F(openai.ChatModelGPT4o),
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(
				openai.F("Extract all delivery addresses from this image. Return only a JSON array of address strings, no other text. Each address should be a complete street address including street number, street name, city, state/province, and postal code when visible. If no addresses are found, return an empty array."),
				openai.ImagePart(openai.F(fmt.Sprintf("data:image/jpeg;base64,%s", imageBase64))),
			),
		}),
		MaxTokens: openai.F(int64(1000)),
	})

	if err != nil {
		return nil, fmt.Errorf("OpenAI API call failed: %w", err)
	}

	if len(response.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	content := response.Choices[0].Message.Content
	
	// Parse the JSON array of addresses
	var addresses []string
	if err := json.Unmarshal([]byte(content), &addresses); err != nil {
		return nil, fmt.Errorf("failed to parse OpenAI response as JSON: %w", err)
	}

	return addresses, nil
}

func geocodeAddress(address string) (Address, error) {
	// Use U.S. Census Geocoding API
	encodedAddr := url.QueryEscape(address)
	geocodeURL := fmt.Sprintf("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=%s&benchmark=Public_AR_Current&format=json", encodedAddr)

	resp, err := http.Get(geocodeURL)
	if err != nil {
		return Address{}, fmt.Errorf("geocoding request failed: %w", err)
	}
	defer resp.Body.Close()

	var result GeocodeResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return Address{}, fmt.Errorf("failed to decode geocoding response: %w", err)
	}

	if len(result.Result.AddressMatches) == 0 {
		return Address{}, fmt.Errorf("no geocoding results found")
	}

	match := result.Result.AddressMatches[0]
	return Address{
		Original:     address,
		Standardized: match.MatchedAddress,
		Latitude:     match.Coordinates.Y,
		Longitude:    match.Coordinates.X,
	}, nil
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ParseAddressesResponse{
		Error: message,
	})
}