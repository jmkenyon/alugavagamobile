import { API_URL } from "@/app/config";

interface FetchListingsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  lat?: number;
  lng?: number;
}

export async function fetchListings(params: FetchListingsParams = {}) {
  // Build query string
  const query = new URLSearchParams();
  if (params.userId) query.append("userId", params.userId);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.lat) query.append("lat", params.lat.toString());
  if (params.lng) query.append("lng", params.lng.toString());

  const url = `${API_URL}/api/listings${query.toString() ? `?${query.toString()}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}