package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"route.dog/api/internal/handler"
	"route.dog/api/internal/model"
	"route.dog/api/internal/service"
)

// Simple 1x1 pixel PNG encoded as base64 for testing
const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

func setupTestServer(t *testing.T) *httptest.Server {
	// Initialize services
	openaiService, err := service.NewOpenAIService()
	if err != nil {
		if os.Getenv("OPENAI_API_KEY") == "" {
			t.Skip("Skipping test: OPENAI_API_KEY not set")
		}
		t.Fatalf("Failed to initialize OpenAI service: %v", err)
	}

	geocodingService := service.NewGeocodingService()
	addressHandler := handler.NewAddressHandler(openaiService, geocodingService)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/v1", func(r chi.Router) {
		r.Post("/addresses", addressHandler.ParseAddresses)
	})

	return httptest.NewServer(r)
}

func TestParseAddresses_Success(t *testing.T) {
	server := setupTestServer(t)
	defer server.Close()

	reqBody := model.ParseAddressesRequest{
		Image: testImageBase64,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		t.Fatalf("Failed to marshal request body: %v", err)
	}

	resp, err := http.Post(server.URL+"/v1/addresses", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			t.Logf("Failed to close response body: %v", err)
		}
	}()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	var response model.ParseAddressesResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response.Error != "" {
		t.Logf("API returned error (expected for test image): %s", response.Error)
	}

	// The response should have the addresses field (even if empty due to test image)
	if response.Addresses == nil {
		t.Error("Expected addresses field in response")
	}
}

func TestParseAddresses_MissingImage(t *testing.T) {
	server := setupTestServer(t)
	defer server.Close()

	reqBody := model.ParseAddressesRequest{
		Image: "",
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		t.Fatalf("Failed to marshal request body: %v", err)
	}

	resp, err := http.Post(server.URL+"/v1/addresses", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			t.Logf("Failed to close response body: %v", err)
		}
	}()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}

	var response model.ParseAddressesResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	expectedError := "Image is required"
	if response.Error != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, response.Error)
	}
}

func TestParseAddresses_InvalidJSON(t *testing.T) {
	server := setupTestServer(t)
	defer server.Close()

	invalidJSON := `{"image": invalid json}`

	resp, err := http.Post(server.URL+"/v1/addresses", "application/json", bytes.NewBufferString(invalidJSON))
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			t.Logf("Failed to close response body: %v", err)
		}
	}()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

// TestGeocodingService tests the geocoding functionality
func TestGeocodingService(t *testing.T) {
	geocodingService := service.NewGeocodingService()

	// Test with a known address
	testAddress := "1600 Pennsylvania Ave NW, Washington, DC 20500"

	result, err := geocodingService.GeocodeAddress(testAddress)
	if err != nil {
		t.Fatalf("Geocoding failed: %v", err)
	}

	if result.Original != testAddress {
		t.Errorf("Expected original address '%s', got '%s'", testAddress, result.Original)
	}

	if result.Standardized == "" {
		t.Error("Expected non-empty standardized address")
	}

	// White House should be around these coordinates
	if result.Latitude < 38.0 || result.Latitude > 39.0 {
		t.Errorf("Expected latitude around 38.9, got %f", result.Latitude)
	}

	if result.Longitude > -76.0 || result.Longitude < -78.0 {
		t.Errorf("Expected longitude around -77.0, got %f", result.Longitude)
	}

	t.Logf("Geocoded result: %+v", result)
}
