/**
 * Route.dog API - Cloudflare Workers TypeScript
 *
 * Address extraction and geocoding service using OpenAI Vision and US Census APIs.
 */

export interface Env {
	OPENAI_API_KEY: string;
	ENVIRONMENT: string;
}

interface Address {
	original: string;
	standardized: string;
	latitude: number;
	longitude: number;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const { pathname, method } = { pathname: url.pathname, method: request.method };

		// CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Content-Type': 'application/json',
		};

		// Handle CORS preflight
		if (method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		try {
			// Health check endpoints
			if (pathname === '/' || pathname === '/health') {
				return jsonResponse({ status: 'healthy', message: 'Route.dog API is running' }, corsHeaders);
			}

			// POST /v1/addresses - Extract addresses from image
			if (pathname === '/v1/addresses' && method === 'POST') {
				return await handleParseAddresses(request, env, corsHeaders);
			}

			// PUT /v1/geocode-address - Geocode single address
			if (pathname === '/v1/geocode-address' && method === 'PUT') {
				return await handleGeocodeAddress(request, corsHeaders);
			}

			// Not found
			return jsonResponse({ error: 'Not found' }, corsHeaders, 404);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			return jsonResponse({ error: message }, corsHeaders, 500);
		}
	},
};

/**
 * Handle POST /v1/addresses - Extract addresses from image using OpenAI Vision
 */
async function handleParseAddresses(
	request: Request,
	env: Env,
	corsHeaders: Record<string, string>
): Promise<Response> {
	try {
		const body = await request.json() as { image?: string };

		if (!body.image) {
			return jsonResponse({ error: 'Image is required' }, corsHeaders, 400);
		}

		let imageBase64 = body.image;

		// Remove data URL prefix if present
		if (imageBase64.startsWith('data:image/')) {
			const parts = imageBase64.split(',');
			if (parts.length > 1) {
				imageBase64 = parts[1];
			}
		}

		// Extract addresses using OpenAI Vision
		const extractedAddresses = await extractAddressesWithOpenAI(imageBase64, env.OPENAI_API_KEY);

		// Geocode each address
		const geocodedAddresses: Address[] = [];
		for (const addr of extractedAddresses) {
			try {
				const geocoded = await geocodeAddressCensus(addr);
				geocodedAddresses.push(geocoded);
			} catch (error) {
				// If geocoding fails, include with zero coordinates
				geocodedAddresses.push({
					original: addr,
					standardized: addr,
					latitude: 0.0,
					longitude: 0.0,
				});
			}
		}

		return jsonResponse({ addresses: geocodedAddresses }, corsHeaders);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return jsonResponse({ error: `Failed to process image: ${message}` }, corsHeaders, 500);
	}
}

/**
 * Handle PUT /v1/geocode-address - Geocode single address
 */
async function handleGeocodeAddress(
	request: Request,
	corsHeaders: Record<string, string>
): Promise<Response> {
	try {
		const body = await request.json() as { address?: string };

		if (!body.address) {
			return jsonResponse({ error: 'Address is required' }, corsHeaders, 400);
		}

		try {
			const geocoded = await geocodeAddressCensus(body.address);
			return jsonResponse(geocoded, corsHeaders);
		} catch (error) {
			// Return with zero coordinates if geocoding fails
			return jsonResponse({
				original: body.address,
				standardized: body.address,
				latitude: 0.0,
				longitude: 0.0,
			}, corsHeaders);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return jsonResponse({ error: message }, corsHeaders, 500);
	}
}

/**
 * Extract addresses from image using OpenAI Vision API
 */
async function extractAddressesWithOpenAI(imageBase64: string, apiKey: string): Promise<string[]> {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: 'gpt-4o',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: 'Extract all delivery addresses from this image. Return only a JSON array of address strings, no other text. Each address should be a complete street address including street number, street name, city, state/province, and postal code when visible. If no addresses are found, return an empty array.',
						},
						{
							type: 'image_url',
							image_url: {
								url: `data:image/jpeg;base64,${imageBase64}`,
							},
						},
					],
				},
			],
			max_tokens: 1000,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
	}

	const result = await response.json() as {
		choices?: Array<{ message: { content: string } }>;
	};

	if (!result.choices || result.choices.length === 0) {
		throw new Error('No response from OpenAI');
	}

	const content = result.choices[0].message.content;

	// Parse JSON array
	try {
		const addresses = JSON.parse(content);
		if (!Array.isArray(addresses)) {
			throw new Error('Expected JSON array');
		}
		return addresses;
	} catch (error) {
		throw new Error(`Failed to parse OpenAI response: ${error}`);
	}
}

/**
 * Geocode address using US Census API
 */
async function geocodeAddressCensus(address: string): Promise<Address> {
	const encodedAddress = encodeURIComponent(address);
	const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodedAddress}&benchmark=Public_AR_Current&format=json`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Geocoding API error: ${response.status}`);
	}

	const result = await response.json() as {
		result?: {
			addressMatches?: Array<{
				matchedAddress: string;
				coordinates: {
					x: number; // longitude
					y: number; // latitude
				};
			}>;
		};
	};

	const matches = result?.result?.addressMatches;
	if (!matches || matches.length === 0) {
		throw new Error('No geocoding results found');
	}

	const match = matches[0];
	return {
		original: address,
		standardized: match.matchedAddress,
		latitude: match.coordinates.y,
		longitude: match.coordinates.x,
	};
}

/**
 * Helper to create JSON responses
 */
function jsonResponse(data: any, headers: Record<string, string>, status: number = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers,
	});
}
