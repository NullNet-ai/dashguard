import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation
const PLACES_API = process.env.PLACES_API ?? "https://api.places.platform.dnadev.net";
const authtoken = Buffer.from(
  `places-api:4lc0UxobR=DuyL4r?=uS`,
  "utf8",
).toString("base64");
const options = {
  headers: {
    Authorization: `Basic ${authtoken}`,
  },
};

// api.places.platform.dnadev.net

export const googleRouter = createTRPCRouter({
  // autoComplete: publicProcedure
  //   .input(
  //     z.object({
  //       query: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     const country = await getGeolocation();
  //     const apiKey = process.env.GOOGLE_PLACES_API_KEY! as string;
  //     const url = "https://places.googleapis.com/v1/places:autocomplete";
  //     const primaryTypes = [
  //       "street_address",
  //       "subpremise",
  //       "route",
  //       "street_number",
  //       "landmark",
  //     ];
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-Goog-Api-Key": apiKey,
  //       },
  //       body: JSON.stringify({
  //         input: input.query,
  //         includedPrimaryTypes: primaryTypes,
  //         // Location biased towards the user's country
  //         // * Commented out to allow for global search
  //         // includedRegionCodes: [country || "US"],
  //         includedRegionCodes: [country],
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     return {
  //       data: data.suggestions,
  //       error: null,
  //     };
  //   }),
  // place: publicProcedure
  //   .input(
  //     z.object({
  //       placeId: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     const apiKey = process.env.GOOGLE_PLACES_API_KEY! as string;
  //     const url = `https://places.googleapis.com/v1/${input.placeId}`;

  //     if (!apiKey) {
  //       throw new Error("Google Places API key is missing");
  //     }

  //     const response = await fetch(url, {
  //       headers: {
  //         "X-Goog-Api-Key": apiKey,
  //         "X-Goog-FieldMask":
  //           // Include expected fields in the response
  //           "adrFormatAddress,shortFormattedAddress,formattedAddress,location,addressComponents",
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     const dataFinderRegx = (c: string) => {
  //       const regx = new RegExp(`<span class="${c}">([^<]+)<\/span>`);
  //       const match = data.adrFormatAddress.match(regx);
  //       return match ? match[1] : "";
  //     };

  //     const address1 = dataFinderRegx("street-address");
  //     const address2 = "";
  //     const city = dataFinderRegx("locality");
  //     const region = dataFinderRegx("region");
  //     const postalCode = dataFinderRegx("postal-code");
  //     const country = dataFinderRegx("country-name");
  //     const lat = data.location.latitude;
  //     const lng = data.location.longitude;

  //     const formattedAddress = data.formattedAddress;

  //     const formattedData: AddressType = {
  //       address2,
  //       formattedAddress,
  //       city,
  //       region,
  //       postalCode,
  //       country,
  //       lat,
  //       lng,
  //     };

  //     return {
  //       data: {
  //         address: formattedData,
  //         adrAddress: data.adrFormatAddress,
  //       },
  //       error: null,
  //     };
  //   }),
  searchPlace: privateProcedure
    .input(
      z.object({
        query: z.string(),
        accuracy: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const accuracy = input?.accuracy || 0;
      const response = await fetch(
        `${PLACES_API}/autocomplete?search=${input?.query}&accuracy=${accuracy}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authtoken}`,
          },
        },
      )
        .then((res) => {
          return res.json();
        })

        .catch((json) => {
          return {
            message: "Error fetch data",
            status: json.status,
            data: {
              name: "",
              description: "",
              place_id: "",
              id: "",
              provider: "",
            },
          };
        });

      return response as Promise<{
        data: {
          name: string;
          description: string;
          place_id: string;
          id: string;
          provider: string;
        }[];
      }>;
    }),
  getAddressDetails: privateProcedure
    .input(
      z.object({
        address: z.object({
          name: z.string(),
          description: z.string(),
          place_id: z.string(),
          id: z.string(),
          provider: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await fetch(`${PLACES_API}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authtoken}`,
        },
        body: JSON.stringify(input?.address),
      });
      const data = await response.json();
      return {
        address_line_one: "",
        address_line_two: "",
        ...data,
      } as Promise<{
        data: {
          address: string;
          address_line_one: string;
          address_line_two: string;
          latitude: number;
          longitude: number;
          place_id: string;
          street_number: string;
          street: string;
          city: string;
          region: string;
          region_code: string;
          country: string;
          country_code: string;
          postal_code: string;
          state: string;
        };
      }>;
    }),
  checkApiReadiness: privateProcedure.query(async () => {
    const response = await fetch(`${PLACES_API}/ready`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authtoken}`,
      },
    });
    return response.json() as Promise<{
      status: "ok";
    }>;
  }),
});
