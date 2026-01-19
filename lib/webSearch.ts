// Web search functionality using SerpAPI for real-time data
import { getJson } from "serpapi";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Search for university admission information using SerpAPI
 * Returns real-time data from Google search results
 */
export async function searchUniversityAdmissionInfo(
  university: string,
  program: string,
  country: string
): Promise<SearchResult[]> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping web search");
    return [];
  }

  try {
    // Construct search query for admission information
    const query = `${university} ${program} admission requirements deadlines ${country} 2026`;
    
    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 10, // Get top 10 results
    });

    // Extract organic search results
    const organicResults = results.organic_results || [];
    
    return organicResults.map((result: any) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
    }));
  } catch (error: any) {
    console.error("SerpAPI search error:", error.message);
    return [];
  }
}

/**
 * Search specifically for program structure and curriculum
 */
export async function searchProgramStructure(
  university: string,
  program: string
): Promise<SearchResult[]> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping web search");
    return [];
  }

  try {
    const query = `${university} ${program} curriculum courses modules structure`;
    
    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 5,
    });

    const organicResults = results.organic_results || [];
    
    return organicResults.map((result: any) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
    }));
  } catch (error: any) {
    console.error("SerpAPI search error:", error.message);
    return [];
  }
}

/**
 * Search for university campus images using SerpAPI
 * Returns image URLs from Google Images
 */
export async function searchUniversityImage(
  university: string,
  country: string
): Promise<string | null> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping image search");
    return null;
  }

  // Try multiple search queries to find the best image
  // Order matters - more specific queries first
  const queries = [
    `${university} ${country} campus building exterior architecture`,
    `${university} ${country} university campus main building`,
    `${university} ${country} campus aerial view`,
    `${university} ${country} university building`,
    `${university} ${country} campus`,
    `${university} campus ${country}`,
    `${university} ${country}`,
  ];

  for (const query of queries) {
    try {
      console.log(`Searching for image: ${query}`);
      
      const results = await getJson({
        engine: "google_images",
        q: query,
        api_key: process.env.SERPAPI_KEY,
        num: 10, // Get top 10 images to find the best one
        safe: "active",
      });

      // Extract image URLs from results
      const images = results.images_results || results.images || [];
      
      if (images.length > 0) {
        // Try to find a high-quality image (prefer original size)
        for (const image of images) {
          // Try different possible fields for image URL
          const imageUrl = image.original || 
                          image.link || 
                          image.url ||
                          image.source ||
                          (image.thumbnail && image.thumbnail.replace(/\/thumb\//, '/')) ||
                          null;
          
          if (imageUrl && imageUrl.startsWith('http')) {
            // Prefer images that look like campus/university buildings
            // Check if URL suggests it's a good image (not a logo, icon, etc.)
            const urlLower = imageUrl.toLowerCase();
            if (!urlLower.includes('logo') && 
                !urlLower.includes('icon') && 
                !urlLower.includes('avatar') &&
                (urlLower.includes('campus') || 
                 urlLower.includes('university') || 
                 urlLower.includes('building') ||
                 urlLower.includes('college') ||
                 image.original)) { // If it's an original, it's likely good quality
              console.log(`Found image for ${university}: ${imageUrl}`);
              return imageUrl;
            }
          }
        }
        
        // If no "perfect" match, use the first valid image
        for (const image of images) {
          const imageUrl = image.original || 
                          image.link || 
                          image.url ||
                          image.source ||
                          (image.thumbnail && image.thumbnail.replace(/\/thumb\//, '/')) ||
                          null;
          
          if (imageUrl && imageUrl.startsWith('http')) {
            console.log(`Found image for ${university} (fallback): ${imageUrl}`);
            return imageUrl;
          }
        }
      }
    } catch (error: any) {
      console.error(`SerpAPI image search error for ${university} with query "${query}":`, error.message);
      // Continue to next query
      continue;
    }
  }
  
  console.warn(`No images found for ${university} after trying ${queries.length} queries`);
  return null;
}

/**
 * Search specifically for admission requirements (grades, exams, documents, etc.)
 */
export async function searchAdmissionRequirements(
  university: string,
  program: string,
  country: string
): Promise<SearchResult[]> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping requirements search");
    return [];
  }

  try {
    const query = `${university} ${program} admission requirements GPA exam scores video essay resume CV ${country} 2026`;
    
    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 10,
    });

    const organicResults = results.organic_results || [];
    
    return organicResults.map((result: any) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
    }));
  } catch (error: any) {
    console.error("SerpAPI requirements search error:", error.message);
    return [];
  }
}

/**
 * Search for student housing/dormitories using SerpAPI
 */
export async function searchStudentHousing(
  university: string,
  city: string,
  country: string
): Promise<SearchResult[]> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping housing search");
    return [];
  }

  try {
    const query = `${university} ${city} ${country} student housing dormitory accommodation residence hall 2026`;
    
    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 10,
    });

    const organicResults = results.organic_results || [];
    
    return organicResults.map((result: any) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
    }));
  } catch (error: any) {
    console.error("SerpAPI housing search error:", error.message);
    return [];
  }
}

/**
 * Search for housing facility images using SerpAPI
 */
export async function searchHousingImage(
  housingName: string,
  city: string,
  country: string
): Promise<string | null> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping housing image search");
    return null;
  }

  try {
    const query = `${housingName} ${city} ${country} student housing dormitory building exterior interior`;
    
    console.log(`Searching for housing image: ${query}`);
    
    const results = await getJson({
      engine: "google_images",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 5,
    });

    console.log("SerpAPI housing image search results:", JSON.stringify(results, null, 2));

    const images = results.images_results || results.images || [];
    
    if (images.length > 0) {
      const firstImage = images[0];
      const imageUrl = firstImage.original || 
                      firstImage.link || 
                      firstImage.url ||
                      firstImage.source ||
                      (firstImage.thumbnail && firstImage.thumbnail.replace(/\/thumb\//, '/')) ||
                      null;
      
      if (imageUrl) {
        console.log(`Found image for ${housingName}: ${imageUrl}`);
        return imageUrl;
      }
    }
    
    console.warn(`No images found for ${housingName}`);
    return null;
  } catch (error: any) {
    console.error(`SerpAPI housing image search error for ${housingName}:`, error.message);
    if (error.response) {
      console.error("Error response:", error.response);
    }
    return null;
  }
}

/**
 * Search for country information and cost of living
 */
export async function searchCountryInfo(country: string): Promise<SearchResult[]> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping country info search");
    return [];
  }

  try {
    const query = `${country} student life cost of living 2026 accommodation food transport expenses university study`;
    
    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 10,
    });

    const organicResults = results.organic_results || [];
    
    return organicResults.map((result: any) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
    }));
  } catch (error: any) {
    console.error("SerpAPI country info search error:", error.message);
    return [];
  }
}

/**
 * Search for country advantages, benefits, challenges for students
 */
export async function searchCountryAdvantages(country: string): Promise<SearchResult[]> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping country advantages search");
    return [];
  }

  try {
    const query = `${country} study abroad advantages benefits challenges pros cons for international students`;
    
    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 10,
    });

    const organicResults = results.organic_results || [];
    
    return organicResults.map((result: any) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
    }));
  } catch (error: any) {
    console.error("SerpAPI country advantages search error:", error.message);
    return [];
  }
}

/**
 * Search for visa and document requirements
 */
export async function searchDocumentRequirements(
  country: string,
  documentType: string
): Promise<SearchResult[]> {
  if (!process.env.SERPAPI_KEY) {
    console.warn("SERPAPI_KEY not configured, skipping document search");
    return [];
  }

  try {
    const query = `${country} student ${documentType} requirements application process 2026`;
    
    const results = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 10,
    });

    const organicResults = results.organic_results || [];
    
    return organicResults.map((result: any) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || "",
    }));
  } catch (error: any) {
    console.error("SerpAPI document search error:", error.message);
    return [];
  }
}

/**
 * Format search results for use in OpenAI prompt
 */
export function formatSearchResultsForPrompt(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No search results available.";
  }

  return results
    .map((result, index) => {
      return `Result ${index + 1}:
Title: ${result.title}
URL: ${result.link}
Snippet: ${result.snippet}`;
    })
    .join("\n\n");
}
