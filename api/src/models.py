"""Pydantic models for API request/response validation."""

from pydantic import BaseModel, Field


class Address(BaseModel):
    """Represents a physical address with geocoding information."""

    original: str = Field(..., description="Original address string")
    standardized: str = Field(..., description="Standardized USPS format address")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")


class ParseAddressesRequest(BaseModel):
    """Request model for parsing addresses from an image."""

    image: str = Field(..., description="Base64 encoded image data")


class ParseAddressesResponse(BaseModel):
    """Response model containing parsed and geocoded addresses."""

    addresses: list[Address] = Field(default_factory=list, description="List of geocoded addresses")


class GeocodeAddressRequest(BaseModel):
    """Request model for geocoding a single address."""

    address: str = Field(..., description="Address string to geocode")


class GeocodeResult(BaseModel):
    """US Census geocoding API result structure."""

    class Coordinates(BaseModel):
        x: float  # longitude
        y: float  # latitude

    class AddressMatch(BaseModel):
        matchedAddress: str
        coordinates: "GeocodeResult.Coordinates"

    class ResultData(BaseModel):
        addressMatches: list["GeocodeResult.AddressMatch"]

    result: ResultData
