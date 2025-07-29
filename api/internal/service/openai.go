package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

// OpenAIService handles OpenAI Vision API interactions
type OpenAIService struct {
	client *openai.Client
}

// NewOpenAIService creates a new OpenAI service instance
func NewOpenAIService() (*OpenAIService, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY not set")
	}

	client := openai.NewClient(option.WithAPIKey(apiKey))
	return &OpenAIService{client: client}, nil
}

// ExtractAddressesFromImage uses OpenAI Vision to extract addresses from an image
func (s *OpenAIService) ExtractAddressesFromImage(imageBase64 string) ([]string, error) {
	// Remove data URL prefix if present
	if strings.HasPrefix(imageBase64, "data:image/") {
		parts := strings.Split(imageBase64, ",")
		if len(parts) > 1 {
			imageBase64 = parts[1]
		}
	}

	response, err := s.client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
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