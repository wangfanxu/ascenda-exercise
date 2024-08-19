import { mergeHotelData } from "../../src/utils/dataMerger";
import { Hotel } from "../../src/interfaces/hotelInterfaces";

describe("mergeHotelData", () => {
  it("should correctly merge hotel data from multiple sources", () => {
    const source1 = [
      {
        id: "1",
        destination_id: 123,
        name: "Hotel A",
        location: { lat: 10, lng: 20, address: "123 Street", city: "City A" },
        description: "A lovely hotel",
        amenities: { general: ["Pool", "Gym"] },
        images: { rooms: [{ url: "room1.jpg", caption: "Room 1" }] },
        booking_conditions: ["No pets allowed"],
      },
    ];

    const source2 = [
      {
        Id: "1",
        DestinationId: 123,
        Name: "Hotel A Deluxe",
        location: {
          lat: 10.1,
          lng: 20.1,
          address: "123 Street",
          city: "City A",
        },
        Description: "A luxurious hotel",
        Facilities: ["Spa"],
        images: { rooms: [{ link: "room2.jpg", description: "Room 2" }] },
        booking_conditions: ["No smoking"],
      },
    ];

    const mergedHotels = mergeHotelData([source1, source2]);

    const expected: Hotel[] = [
      {
        id: "1",
        destinationId: 123,
        name: "Hotel A Deluxe",
        location: {
          lat: 10.1,
          lng: 20.1,
          address: "123 Street",
          city: "City A",
          country: null,
          postalCode: null,
        },
        description: "A luxurious hotel",
        amenities: {
          general: ["Pool", "Gym", "Spa"],
          room: [],
        },
        images: {
          rooms: [
            { link: "room1.jpg", description: "Room 1" },
            { link: "room2.jpg", description: "Room 2" },
          ],
          site: [],
          amenities: [],
        },
        bookingConditions: ["No pets allowed", "No smoking"],
      },
    ];

    expect(mergedHotels).toEqual(expected);
  });

  it("should handle missing fields and merge based on available data", () => {
    const source1 = [
      {
        id: "2",
        destination_id: 456,
        name: "Hotel B",
        location: { lat: 30, lng: 40, address: "456 Avenue" },
        amenities: { general: ["WiFi"] },
        images: { site: [{ url: "site1.jpg", caption: "Site 1" }] },
      },
    ];

    const source2 = [
      {
        id: "2",
        destination: 456,
        hotel_name: "Hotel B Basic",
        location: { lat: 30.5, lng: 40.5 },
        details: "A budget hotel",
        amenities: { general: ["Free breakfast"] },
        images: { site: [{ url: "site2.jpg", caption: "Site 2" }] },
      },
    ];

    const mergedHotels = mergeHotelData([source1, source2]);

    const expected: Hotel[] = [
      {
        id: "2",
        destinationId: 456,
        name: "Hotel B Basic",
        location: {
          lat: 30.5,
          lng: 40.5,
          address: "456 Avenue",
          city: null,
          country: null,
          postalCode: null,
        },
        description: "A budget hotel",
        amenities: {
          general: ["WiFi", "Free breakfast"],
          room: [],
        },
        images: {
          rooms: [],
          site: [
            { link: "site1.jpg", description: "Site 1" },
            { link: "site2.jpg", description: "Site 2" },
          ],
          amenities: [],
        },
        bookingConditions: [],
      },
    ];

    expect(mergedHotels).toEqual(expected);
  });

  it("should merge and deduplicate amenities and images correctly", () => {
    const source1 = [
      {
        id: "3",
        destination_id: 789,
        name: "Hotel C",
        amenities: { general: ["Pool", "Spa"] },
        images: {
          rooms: [{ url: "room1.jpg", caption: "Room 1" }],
          site: [{ url: "site1.jpg", caption: "Site 1" }],
        },
      },
    ];

    const source2 = [
      {
        id: "3",
        DestinationId: 789,
        hotel_name: "Hotel C",
        amenities: { general: ["Gym", "Spa"] },
        images: {
          rooms: [{ link: "room1.jpg", description: "Room 1" }],
          site: [{ link: "site2.jpg", description: "Site 2" }],
        },
      },
    ];

    const mergedHotels = mergeHotelData([source1, source2]);

    const expected: Hotel[] = [
      {
        id: "3",
        destinationId: 789,
        name: "Hotel C",
        location: {
          lat: null,
          lng: null,
          address: null,
          city: null,
          country: null,
          postalCode: null,
        },
        description: null,
        amenities: {
          general: ["Pool", "Spa", "Gym"],
          room: [],
        },
        images: {
          rooms: [{ link: "room1.jpg", description: "Room 1" }],
          site: [
            { link: "site1.jpg", description: "Site 1" },
            { link: "site2.jpg", description: "Site 2" },
          ],
          amenities: [],
        },
        bookingConditions: [],
      },
    ];

    expect(mergedHotels).toEqual(expected);
  });
});
