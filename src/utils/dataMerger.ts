import { Hotel } from "../interfaces/hotelInterfaces";

export function mergeHotelData(sources: any[]): Hotel[] {
  const mergedHotels: { [id: string]: Hotel } = {};

  sources.forEach((source) => {
    source.forEach((hotel: any) => {
      const hotelId = hotel.id || hotel.Id || hotel.hotel_id;

      const trimmedHotel = {
        id: hotelId,
        destinationId:
          hotel.destination_id || hotel.DestinationId || hotel.destination,
        name:
          hotel.name?.trim() || hotel.Name?.trim() || hotel.hotel_name?.trim(),
        location: {
          lat: hotel.lat || hotel.Latitude || hotel.location?.lat || null,
          lng: hotel.lng || hotel.Longitude || hotel.location?.lng || null,
          address:
            hotel.address?.trim() ||
            hotel.Address?.trim() ||
            hotel.location?.address?.trim() ||
            null,
          city: hotel.City?.trim() || hotel.location?.city?.trim() || null,
          country:
            hotel.Country?.trim() || hotel.location?.country?.trim() || null,
          postalCode: hotel.PostalCode?.trim() || null,
        },
        description:
          hotel.description?.trim() ||
          hotel.Description?.trim() ||
          hotel.details?.trim() ||
          null,
        amenities: {
          general: Array.isArray(hotel.amenities?.general)
            ? hotel.amenities.general.map((a: string) => a.trim())
            : Array.isArray(hotel.Facilities)
            ? hotel.Facilities.map((a: string) => a.trim())
            : Array.isArray(hotel.amenities)
            ? hotel.amenities.map((a: string) => a.trim())
            : [],
          room: Array.isArray(hotel.amenities?.room)
            ? hotel.amenities.room.map((a: string) => a.trim())
            : [],
        },
        images: {
          rooms: hotel.images?.rooms || [],
          site: hotel.images?.site || [],
          amenities: hotel.images?.amenities || [],
        },
        bookingConditions: hotel.booking_conditions
          ? hotel.booking_conditions.map((bc: string) => bc.trim())
          : [],
      };

      if (!mergedHotels[hotelId]) {
        mergedHotels[hotelId] = trimmedHotel;
      } else {
        const existingHotel = mergedHotels[hotelId];

        // Merge descriptions, prefer longer or more detailed descriptions
        if (
          trimmedHotel.description &&
          (!existingHotel.description ||
            trimmedHotel.description.length > existingHotel.description.length)
        ) {
          existingHotel.description = trimmedHotel.description;
        }

        // Merge amenities, ensuring no duplicates and applying trimming
        existingHotel.amenities.general = Array.from(
          new Set([
            ...existingHotel.amenities.general.map(normalizeAmenity),
            ...trimmedHotel.amenities.general.map(normalizeAmenity),
          ])
        );

        existingHotel.amenities.room = Array.from(
          new Set([
            ...existingHotel.amenities.room.map(normalizeAmenity),
            ...trimmedHotel.amenities.room.map(normalizeAmenity),
          ])
        );

        // Merge images, removing duplicates based on link and description
        existingHotel.images.rooms = mergeImageArrays(
          existingHotel.images.rooms,
          trimmedHotel.images.rooms
        );
        existingHotel.images.site = mergeImageArrays(
          existingHotel.images.site,
          trimmedHotel.images.site
        );
        existingHotel.images.amenities = mergeImageArrays(
          existingHotel.images.amenities,
          trimmedHotel.images.amenities
        );

        // Merge booking conditions, ensuring no duplicates and applying trimming
        existingHotel.bookingConditions = Array.from(
          new Set([
            ...existingHotel.bookingConditions,
            ...trimmedHotel.bookingConditions,
          ])
        );

        // Update missing location fields
        if (!existingHotel.location.lat) {
          existingHotel.location.lat = trimmedHotel.location.lat;
        }
        if (!existingHotel.location.lng) {
          existingHotel.location.lng = trimmedHotel.location.lng;
        }
        if (!existingHotel.location.address) {
          existingHotel.location.address = trimmedHotel.location.address;
        }
        if (!existingHotel.location.city) {
          existingHotel.location.city = trimmedHotel.location.city;
        }
        if (!existingHotel.location.country) {
          existingHotel.location.country = trimmedHotel.location.country;
        }
        if (!existingHotel.location.postalCode) {
          existingHotel.location.postalCode = trimmedHotel.location.postalCode;
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
