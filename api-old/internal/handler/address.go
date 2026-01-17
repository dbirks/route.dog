package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"route.dog/api/internal/model"
	"route.dog/api/internal/service"
)

// AddressHandler handles address-related HTTP requests
type AddressHandler struct {
	openaiService    *service.OpenAIService
	geocodingService *service.GeocodingService
}

// NewAddressHandler creates a new address handler
func NewAddressHandler(openaiService *service.OpenAIService, geocodingService *service.GeocodingService) *AddressHandler {
	return &AddressHandler{
		openaiService:    openaiService,
		geocodingService: geocodingService,
	}
}

// ParseAddresses handles POST /v1/addresses
func (h *AddressHandler) ParseAddresses(w http.ResponseWriter, r *http.Request) {
	var req model.ParseAddressesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if req.Image == "" {
		h.respondWithError(w, http.StatusBadRequest, "Image is required")
		return
	}

	// Extract addresses from image using OpenAI Vision
	addresses, err := h.openaiService.ExtractAddressesFromImage(req.Image)
	if err != nil {
		h.respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to extract addresses: %v", err))
		return
	}

	// Geocode each address
	var geocodedAddresses []model.Address
	for _, addr := range addresses {
		geocoded, err := h.geocodingService.GeocodeAddress(addr)
		if err != nil {
			log.Printf("Failed to geocode address '%s': %v", addr, err)
			// Still include the address but without coordinates
			geocodedAddresses = append(geocodedAddresses, model.Address{
				Original:     addr,
				Standardized: addr,
				Latitude:     0,
				Longitude:    0,
			})
		} else {
			geocodedAddresses = append(geocodedAddresses, geocoded)
		}
	}

	response := model.ParseAddressesResponse{
		Addresses: geocodedAddresses,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GeocodeAddress handles PUT /v1/geocode-address for single address geocoding
func (h *AddressHandler) GeocodeAddress(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Address string `json:"address"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if req.Address == "" {
		h.respondWithError(w, http.StatusBadRequest, "Address is required")
		return
	}

	// Geocode the address
	geocoded, err := h.geocodingService.GeocodeAddress(req.Address)
	if err != nil {
		log.Printf("Failed to geocode address '%s': %v", req.Address, err)
		// Return the address with zero coordinates if geocoding fails
		response := model.Address{
			Original:     req.Address,
			Standardized: req.Address,
			Latitude:     0,
			Longitude:    0,
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(geocoded); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *AddressHandler) respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(model.ParseAddressesResponse{
		Error: message,
	}) // Ignore encoding error in error handler
}
