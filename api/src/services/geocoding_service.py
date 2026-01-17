"""US Census geocoding API service."""

from urllib.parse import quote

import httpx

from models import Address, GeocodeResult


class GeocodingService:
    """Handles address geocoding using the US Census API."""

    def __init__(self):
        """Initialize geocoding service."""
        self.base_url = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"

    async def geocode_address(self, address: str) -> Address:
        """
        Geocode a single address using the US Census Geocoding API.

        Args:
            address: Address string to geocode

        Returns:
            Address object with standardized address and coordinates

        Raises:
            Exception: If geocoding fails or no results found
        """
        # Construct the API URL
        encoded_address = quote(address)
        url = f"{self.base_url}?address={encoded_address}&benchmark=Public_AR_Current&format=json"

        # Make async HTTP request
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)

            if response.status_code != 200:
                raise Exception(
                    f"Geocoding request failed with status {response.status_code}: {response.text}"
                )

            result_data = response.json()

        # Parse the response using Pydantic model
        try:
            result = GeocodeResult(**result_data)
        except Exception as e:
            raise Exception(f"Failed to parse geocoding response: {e}")

        # Check if we got any matches
        if not result.result.addressMatches or len(result.result.addressMatches) == 0:
            raise Exception("No geocoding results found")

        # Return the first match
        match = result.result.addressMatches[0]
        return Address(
            original=address,
            standardized=match.matchedAddress,
            latitude=match.coordinates.y,
            longitude=match.coordinates.x,
        )
