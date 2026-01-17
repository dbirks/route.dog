package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"route.dog/api/internal/model"
)

// GeocodingService handles address geocoding using the US Census API
type GeocodingService struct{}

// NewGeocodingService creates a new geocoding service instance
func NewGeocodingService() *GeocodingService {
	return &GeocodingService{}
}

// GeocodeAddress geocodes a single address using the US Census Geocoding API
func (s *GeocodingService) GeocodeAddress(address string) (model.Address, error) {
	// Use U.S. Census Geocoding API
	encodedAddr := url.QueryEscape(address)
	geocodeURL := fmt.Sprintf("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=%s&benchmark=Public_AR_Current&format=json", encodedAddr)

	resp, err := http.Get(geocodeURL)
	if err != nil {
		return model.Address{}, fmt.Errorf("geocoding request failed: %w", err)
	}
	defer func() {
		_ = resp.Body.Close() // Ignore error on close
	}()

	var result model.GeocodeResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return model.Address{}, fmt.Errorf("failed to decode geocoding response: %w", err)
	}

	if len(result.Result.AddressMatches) == 0 {
		return model.Address{}, fmt.Errorf("no geocoding results found")
	}

	match := result.Result.AddressMatches[0]
	return model.Address{
		Original:     address,
		Standardized: match.MatchedAddress,
		Latitude:     match.Coordinates.Y,
		Longitude:    match.Coordinates.X,
	}, nil
}
