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
    rooms: { link: string; description: string }[];
    site: { link: string; description: string }[];
    amenities: { link: string; description: string }[];
  };
  bookingConditions: string[];
}
