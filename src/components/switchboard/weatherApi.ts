'use client';

// Define the weather API response interface
interface WeatherApiResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

// Define the weather data interface for the API response
export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

// Define success and error response types
interface SuccessResponse {
  success: true;
  data: WeatherData;
}

interface ErrorResponse {
  success: false;
  message: string;
}

type WeatherApiResult = SuccessResponse | ErrorResponse;

// API key and default location
const API_KEY = 'e83b3c4c08285bf87b99f9bbc0abe3f0'; // Replace with your actual API key
const DEFAULT_LOCATION = 'India';

// Weather API service
export const weatherApi = {
  // In a real application, you would use environment variables for the API key
  // and would implement proper error handling and caching
  
  // Fetch weather by city name
  async fetchWeather(location: string = DEFAULT_LOCATION): Promise<WeatherApiResult> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
      }
      
      const data: WeatherApiResponse = await response.json();
      
      return {
        success: true,
        data: {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          icon: data.weather[0].icon,
          location: data.name,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed
        }
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch weather data'
      };
    }
  },
  
  // Fetch weather by coordinates
  async fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherApiResult> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
      }
      
      const data: WeatherApiResponse = await response.json();
      
      return {
        success: true,
        data: {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          icon: data.weather[0].icon,
          location: data.name,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed
        }
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch weather data'
      };
    }
  }
};