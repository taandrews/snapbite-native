/**
 * OpenAI Service for Restaurant Analysis
 * Production-ready implementation with error handling
 */

export interface RestaurantData {
  name: string;
  rating: number;
  address: string;
  cuisine: string;
  priceRange: string;
  phoneNumber?: string;
  website?: string;
  reviewCount?: number;
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeRestaurantImage(base64Image: string): Promise<RestaurantData | null> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'system',
              content: `You are an expert restaurant data extractor. Analyze the image and extract restaurant information in JSON format with these exact fields:
              {
                "name": "restaurant name",
                "rating": numerical_rating,
                "address": "full address",
                "cuisine": "cuisine type", 
                "priceRange": "$ or $$ or $$$ or $$$$",
                "phoneNumber": "phone if visible",
                "website": "website if visible",
                "reviewCount": number_of_reviews
              }
              Return only valid JSON. If no restaurant found, return null.`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract restaurant information from this screenshot',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
      }

      const content = data.choices[0].message.content;
      const restaurantData = JSON.parse(content);
      
      // Validate required fields
      if (!restaurantData.name || !restaurantData.rating || !restaurantData.address) {
        throw new Error('Incomplete restaurant data extracted');
      }

      return restaurantData;
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}