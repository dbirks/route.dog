"""Address parsing and geocoding API routes."""

import logging

from fastapi import APIRouter, HTTPException

from models import (
    Address,
    GeocodeAddressRequest,
    ParseAddressesRequest,
    ParseAddressesResponse,
)
from services.geocoding_service import GeocodingService
from services.openai_service import OpenAIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["addresses"])


@router.post("/addresses", response_model=ParseAddressesResponse)
async def parse_addresses(request: ParseAddressesRequest) -> ParseAddressesResponse:
    """
    Extract addresses from an image and geocode them.

    This endpoint:
    1. Uses OpenAI Vision API to extract addresses from the image
    2. Geocodes each extracted address using the US Census API
    3. Returns a list of addresses with standardized format and coordinates

    Args:
        request: Contains base64-encoded image data

    Returns:
        ParseAddressesResponse with list of geocoded addresses

    Raises:
        HTTPException: If image processing or geocoding fails
    """
    if not request.image:
        raise HTTPException(status_code=400, detail="Image is required")

    # Extract addresses from image using OpenAI Vision
    openai_service = OpenAIService()
    try:
        extracted_addresses = await openai_service.extract_addresses_from_image(
            request.image
        )
    except Exception as e:
        logger.error(f"Failed to extract addresses: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to extract addresses: {str(e)}"
        )

    # Geocode each extracted address
    geocoding_service = GeocodingService()
    geocoded_addresses: list[Address] = []

    for addr in extracted_addresses:
        try:
            geocoded = await geocoding_service.geocode_address(addr)
            geocoded_addresses.append(geocoded)
        except Exception as e:
            logger.warning(f"Failed to geocode address '{addr}': {e}")
            # Include the address without coordinates if geocoding fails
            geocoded_addresses.append(
                Address(
                    original=addr,
                    standardized=addr,
                    latitude=0.0,
                    longitude=0.0,
                )
            )

    return ParseAddressesResponse(addresses=geocoded_addresses)


@router.put("/geocode-address", response_model=Address)
async def geocode_address(request: GeocodeAddressRequest) -> Address:
    """
    Geocode a single address.

    Uses the US Census Geocoding API to standardize and geocode an address.

    Args:
        request: Contains the address string to geocode

    Returns:
        Address object with standardized format and coordinates

    Raises:
        HTTPException: If address is missing or geocoding fails
    """
    if not request.address:
        raise HTTPException(status_code=400, detail="Address is required")

    geocoding_service = GeocodingService()
    try:
        geocoded = await geocoding_service.geocode_address(request.address)
        return geocoded
    except Exception as e:
        logger.warning(f"Failed to geocode address '{request.address}': {e}")
        # Return the address with zero coordinates if geocoding fails
        return Address(
            original=request.address,
            standardized=request.address,
            latitude=0.0,
            longitude=0.0,
        )
