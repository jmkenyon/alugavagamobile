import { API_URL } from "@/app/config";


export interface Listing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  createdAt: string;
  locationValue: string;
  userId: string;
  price: number;
  category: string;
  whatsapp?: string;
  lat: number;
  lng: number;
  distance?: number; // optional, only present if lat/lng filter used
}

interface FetchListingsParams {
  lat?: number;
  lng?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export const fetchListings = async ({
  lat,
  lng,
  startDate,
  endDate,
  userId,
}: FetchListingsParams = {}): Promise<Listing[]> => {
  try {
    const res = await fetch(`${API_URL}/api/mobile-listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, startDate, endDate, userId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erro ao buscar vagas");
    }

    const listings: Listing[] = await res.json();
    return listings;
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
    throw err;
  }
};