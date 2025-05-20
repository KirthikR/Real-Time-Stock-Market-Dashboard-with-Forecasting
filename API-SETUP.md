# Setting Up Real Stock API Integration

This application uses mock data for development, but can be connected to real APIs for production use. Here's how to set up a real API connection:

## Step 1: Get an API Key from Alpha Vantage

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Fill out the form to get a free API key
3. Save your API key for the next step

## Step 2: Create Environment Variables

Create a `.env` file in the root directory:

```
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

## Step 3: Update the Stock API Service

Open the file `src/services/stockApi.ts` and replace the demo key with the environment variable:

```typescript
// Replace this line
const API_KEY = 'demo';

// With this line
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
```

## Step 4: Uncomment Real API Calls

In the same file, uncomment the real API calls:

```typescript
export const searchStockSymbol = async (query: string): Promise<Stock | null> => {
  try {
    // Uncomment these lines to use the real API
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
    );
    
    const matches = response.data.bestMatches || [];
    if (matches.length > 0) {
      const bestMatch = matches[0];
      return {
        symbol: bestMatch['1. symbol'],
        name: bestMatch['2. name'],
        price: 0, // You'll need to make another API call to get the price
        change: 0, // You'll need to make another API call to get the change
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error searching for stock:", error);
    return null;
  }
};
```

## API Limitations

The free tier of Alpha Vantage has the following limitations:
- 5 API requests per minute
- 500 API requests per day

For a production application, consider upgrading to a paid plan or using an alternative API provider like Yahoo Finance, Polygon.io, or IEX Cloud.

## Alternative Configuration: Using a Proxy Server

To protect your API keys and avoid rate limiting, consider setting up a proxy server:

1. Create a simple Express server in a separate repo
2. Make your API calls from the server with your API key
3. Have your frontend call your proxy server instead of directly calling Alpha Vantage

This approach is more secure and gives you better control over API usage.
