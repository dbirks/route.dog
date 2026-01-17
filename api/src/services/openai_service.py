"""OpenAI Vision API service for extracting addresses from images."""

import json
import os
from typing import Optional

import httpx


class OpenAIService:
    """Handles OpenAI Vision API interactions for address extraction."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize OpenAI service with API key."""
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set")

        self.base_url = "https://api.openai.com/v1"

    async def extract_addresses_from_image(self, image_base64: str) -> list[str]:
        """
        Extract addresses from a base64-encoded image using OpenAI Vision API.

        Args:
            image_base64: Base64 encoded image data (with or without data URL prefix)

        Returns:
            List of extracted address strings

        Raises:
            Exception: If the API call fails or returns invalid data
        """
        # Remove data URL prefix if present
        if image_base64.startswith("data:image/"):
            parts = image_base64.split(",", 1)
            if len(parts) > 1:
                image_base64 = parts[1]

        # Construct the API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        payload = {
            "model": "gpt-4o",  # GPT-4 with vision capabilities
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Extract all delivery addresses from this image. "
                                "Return only a JSON array of address strings, no other text. "
                                "Each address should be a complete street address including "
                                "street number, street name, city, state/province, and postal "
                                "code when visible. If no addresses are found, return an empty array."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                }
            ],
            "max_tokens": 1000,
        }

        # Make async HTTP request to OpenAI API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )

            if response.status_code != 200:
                raise Exception(
                    f"OpenAI API call failed with status {response.status_code}: {response.text}"
                )

            result = response.json()

        # Extract the response content
        if not result.get("choices") or len(result["choices"]) == 0:
            raise Exception("No response from OpenAI")

        content = result["choices"][0]["message"]["content"]

        # Parse the JSON array of addresses
        try:
            addresses = json.loads(content)
            if not isinstance(addresses, list):
                raise ValueError("Expected a JSON array")
            return addresses
        except (json.JSONDecodeError, ValueError) as e:
            raise Exception(f"Failed to parse OpenAI response as JSON: {e}")
