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

        //merge name, prefer longer or more detailed name
        if (
          trimmedHotel.name &&
          (!existingHotel.name ||
            trimmedHotel.name.length > existingHotel.name.length)
        ) {
          existingHotel.name = trimmedHotel.name;
        }
        if (
          trimmedHotel.description &&
          (!existingHotel.description ||
            trimmedHotel.description.length > existingHotel.description.length)
        ) {
          // Merge descriptions, prefer longer or more detailed descriptions
          existingHotel.description = trimmedHotel.description;
        }

        // Merge amenities, ensuring no duplicates and applying trimming
        existingHotel.amenities.general = mergeAmenities(
          existingHotel.amenities.general,
          trimmedHotel.amenities.general
        );

        existingHotel.amenities.room = mergeAmenities(
          existingHotel.amenities.room,
          trimmedHotel.amenities.room
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

        // Update missing location fields or take more precise values
        if (
          !existingHotel.location.lat ||
          (trimmedHotel.location.lat &&
            getPrecision(trimmedHotel.location.lat) >
              getPrecision(existingHotel.location.lat))
        ) {
          existingHotel.location.lat = trimmedHotel.location.lat;
        }

        if (
          !existingHotel.location.lng ||
          (trimmedHotel.location.lng &&
            getPrecision(trimmedHotel.location.lng) >
              getPrecision(existingHotel.location.lng))
        ) {
          existingHotel.location.lng = trimmedHotel.location.lng;
        }
        if (
          !existingHotel.location.address ||
          (trimmedHotel.location.address &&
            trimmedHotel.location.address.length >
              existingHotel.location.address.length)
        ) {
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
  arr1: {
    link?: string;
    url?: string;
    caption?: string;
    description?: string;
  }[],
  arr2: {
    link?: string;
    url?: string;
    caption?: string;
    description?: string;
  }[]
) {
  const combined = [...arr1, ...arr2].map((image) => ({
    link: image.link || image.url,
    description: image.description || image.caption || "",
  }));

  const uniqueImages = combined.filter(
    (image, index, self) =>
      index ===
      self.findIndex(
        (t) => t.link === image.link && t.description === image.description
      )
  );

  return uniqueImages;
}

function normalizeAmenity(amenity: string) {
  const normalized = amenity
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase words
    .toLowerCase() // Convert to lowercase
    .trim(); // Remove any leading or trailing spaces
  return {
    original: amenity,
    normalized,
  };
}

function mergeAmenities(arr1: string[], arr2: string[]): string[] {
  const normalizedMap = new Map<string, string>();

  [...arr1, ...arr2].forEach((amenity) => {
    const { original, normalized } = normalizeAmenity(amenity);
    if (!normalizedMap.has(normalized)) {
      normalizedMap.set(normalized, original);
    }
  });

  return Array.from(normalizedMap.values());
}

function getPrecision(value: number | null): number {
  if (value === null || value === undefined) return 0;
  const decimalPart = value.toString().split(".")[1];

  return decimalPart ? decimalPart.length : 0;
}
