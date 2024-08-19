export interface Hotel {
  id: string;
  destinationId: number;
  name: string;
  location: {
    lat: number | null;
    lng: number | null;
    address: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
  };
  description: string | null;
  amenities: {
    general: string[];
    room: string[];
  };
  images: {
    rooms: { url?: string; link?: string; description: string }[];
    site: { url?: string; link?: string; description: string }[];
    amenities: { url?: string; link?: string; description: string }[];
  };
  bookingConditions: string[];
}
