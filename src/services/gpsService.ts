export async function getCurrentPosition() {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported.');
  }

  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

type NominatimResponse = {
  display_name?: string;
  address?: {
    province?: string;
    state?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    city_district?: string;
    ward?: string;
    borough?: string;
    suburb?: string;
    quarter?: string;
    neighbourhood?: string;
    road?: string;
    house_number?: string;
  };
  error?: string;
};

function uniqueParts(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part, index, values) => values.indexOf(part) === index);
}

function formatJapaneseAddress(data: NominatimResponse) {
  const address = data.address;
  if (!address) return data.display_name?.replace(/日本,?\s*/g, '').replace(/〒?\d{3}-?\d{4},?\s*/g, '').trim() ?? '';

  const prefecture = address.province ?? address.state;
  const municipality = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county;
  const localArea = uniqueParts([address.ward, address.city_district, address.borough, address.suburb, address.quarter, address.neighbourhood]);
  const street = address.road;
  const houseNumber = address.house_number;

  return uniqueParts([prefecture, municipality, ...localArea, street, houseNumber]).join('');
}

export async function reverseGeocode(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'ja'
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Reverse geocoding failed.');
  }
  const data = (await response.json()) as NominatimResponse;
  if ((!data.display_name && !data.address) || data.error) {
    throw new Error('Address not found.');
  }
  const address = formatJapaneseAddress(data);
  if (!address) {
    throw new Error('Address not found.');
  }
  return address;
}
