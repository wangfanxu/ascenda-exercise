import { Hotel } from "../interfaces/hotelInterfaces";

export function mergeHotelData(sources: any[]): Hotel[] {
  const mergedHotels: { [id: string]: Hotel } = {};

  sources.forEach((source) => {
    source.forEach((hotel: any) => {
      const hotelId = hotel.id || hotel.Id || hotel.hotel_id;

      if (!mergedHotels[hotelId]) {
        mergedHotels[hotelId] = {
          id: hotelId,
          destinationId:
            hotel.destination_id || hotel.DestinationId || hotel.destination,
          name: hotel.name || hotel.Name || hotel.hotel_name,
          location: {
            lat: hotel.lat || hotel.Latitude || hotel.location?.lat || null,
            lng: hotel.lng || hotel.Longitude || hotel.location?.lng || null,
            address:
              hotel.address || hotel.Address || hotel.location?.address || null,
            city: hotel.City || hotel.location?.city || null,
            country: hotel.Country || hotel.location?.country || null,
            postalCode: hotel.PostalCode || null,
          },
          description:
            hotel.description || hotel.Description || hotel.details || null,
          amenities: {
            general:
              hotel.amenities?.general ||
              hotel.Facilities ||
              hotel.amenities ||
              [],
            room: hotel.amenities?.room || [],
          },
          images: {
            rooms: hotel.images?.rooms || [],
            site: hotel.images?.site || [],
            amenities: hotel.images?.amenities || [],
          },
          bookingConditions: hotel.booking_conditions || [],
        };
      } else {
        const existingHotel = mergedHotels[hotelId];

        // Merge descriptions, prefer longer or more detailed descriptions
        if (
          hotel.description &&
          (!existingHotel.description ||
            hotel.description.length > existingHotel.description.length)
        ) {
          existingHotel.description = hotel.description;
        }

        existingHotel.amenities.general = Array.from(
          new Set([
            ...existingHotel.amenities.general.map(normalizeAmenity),
            ...(Array.isArray(hotel.amenities)
              ? hotel.amenities.map(normalizeAmenity)
              : Array.isArray(hotel.amenities?.general)
              ? hotel.amenities.general.map(normalizeAmenity)
              : Array.isArray(hotel.Facilities)
              ? hotel.Facilities.map(normalizeAmenity)
              : []),
          ])
        );

        existingHotel.amenities.room = Array.from(
          new Set([
            ...existingHotel.amenities.room.map(normalizeAmenity),
            ...(Array.isArray(hotel.amenities?.room)
              ? hotel.amenities.room.map(normalizeAmenity)
              : []),
          ])
        );

        // Merge images, removing duplicates based on link and description
        existingHotel.images.rooms = mergeImageArrays(
          existingHotel.images.rooms,
          hotel.images?.rooms || []
        );
        existingHotel.images.site = mergeImageArrays(
          existingHotel.images.site,
          hotel.images?.site || []
        );
        existingHotel.images.amenities = mergeImageArrays(
          existingHotel.images.amenities,
          hotel.images?.amenities || []
        );

        // Merge booking conditions, ensuring no duplicates
        existingHotel.bookingConditions = Array.from(
          new Set([
            ...existingHotel.bookingConditions,
            ...(hotel.booking_conditions || []),
          ])
        );

        // Update missing location fields
        if (!existingHotel.location.lat) {
          existingHotel.location.lat =
            hotel.lat || hotel.Latitude || hotel.location?.lat || null;
        }
        if (!existingHotel.location.lng) {
          existingHotel.location.lng =
            hotel.lng || hotel.Longitude || hotel.location?.lng || null;
        }
        if (!existingHotel.location.address) {
          existingHotel.location.address =
            hotel.address || hotel.Address || hotel.location?.address || null;
        }
        if (!existingHotel.location.city) {
          existingHotel.location.city =
            hotel.City || hotel.location?.city || null;
        }
        if (!existingHotel.location.country) {
          existingHotel.location.country =
            hotel.Country || hotel.location?.country || null;
        }
        if (!existingHotel.location.postalCode) {
          existingHotel.location.postalCode = hotel.PostalCode || null;
        }
      }
    });
  });

  return Object.values(mergedHotels);
}

function mergeImageArrays(
  arr1: { link: string; description: string }[],
  arr2: { link: string; description: string }[]
): { link: string; description: string }[] {
  const combined = [...arr1, ...arr2];
  const uniqueImages = combined.filter(
    (image, index, self) =>
      index ===
      self.findIndex(
        (t) => t.link === image.link && t.description === image.description
      )
  );
  return uniqueImages;
}

function normalizeAmenity(amenity: string): string {
  return amenity
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase words
    .toLowerCase() // Convert to lowercase
    .trim() // Remove any leading or trailing spaces
    .replace(/[\s-]+/g, "-"); // Replace multiple spaces or hyphens with a single space
}
