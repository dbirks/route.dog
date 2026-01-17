package model

// Address represents a physical address with geocoding information
type Address struct {
	Original     string  `json:"original"`
	Standardized string  `json:"standardized"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}

// ParseAddressesRequest represents the incoming request to parse addresses from an image
type ParseAddressesRequest struct {
	Image string `json:"image"` // base64 encoded image
}

// ParseAddressesResponse represents the response containing parsed addresses
type ParseAddressesResponse struct {
	Addresses []Address `json:"addresses"`
	Error     string    `json:"error,omitempty"`
}

// GeocodeResult represents the response from the US Census geocoding API
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
