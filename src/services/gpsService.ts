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
    pedestrian?: string;
    footway?: string;
    path?: string;
    house_number?: string;
  };
  error?: string;
};

function normalizeDisplayParts(displayName?: string) {
  return (displayName ?? '')
    .split(',')
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part) => part !== '日本')
    .filter((part) => !/^〒?\d{3}-?\d{4}$/.test(part));
}

function normalizeAddressPart(part?: string) {
  return part?.replace(/^日本/, '').replace(/^〒?\d{3}-?\d{4}/, '').trim();
}

function uniqueParts(parts: Array<string | undefined>) {
  const values = parts.map(normalizeAddressPart).filter((part): part is string => Boolean(part));
  return values.filter((part, index) => {
    if (values.indexOf(part) !== index) return false;
    const laterPart = values.slice(index + 1).find((value) => value.startsWith(part) && value.length > part.length);
    return !laterPart;
  });
}

function findPrefecture(address: NominatimResponse['address'], displayParts: string[]) {
  return (
    address?.province ??
    address?.state ??
    displayParts.find((part) => /都$|道$|府$|県$/.test(part)) ??
    ''
  );
}

function findMunicipality(address: NominatimResponse['address'], displayParts: string[]) {
  return (
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.county ??
    displayParts.find((part) => /市$|区$|町$|村$/.test(part)) ??
    ''
  );
}

function findHouseNumber(address: NominatimResponse['address'], displayParts: string[]) {
  if (address?.house_number) return address.house_number;
  return (
    displayParts.find((part) => /^\d+([ー\-−]\d+){1,2}$/.test(part)) ??
    displayParts.find((part) => /^\d+番地?(\d+号?)?$/.test(part)) ??
    ''
  );
}

function formatJapaneseAddress(data: NominatimResponse) {
  const address = data.address;
  const displayParts = normalizeDisplayParts(data.display_name);
  if (!address) return displayParts.reverse().join('');

  const prefecture = findPrefecture(address, displayParts);
  const municipality = findMunicipality(address, displayParts);
  const localArea = uniqueParts([address.ward, address.city_district, address.borough, address.suburb, address.quarter, address.neighbourhood]);
  const street = address.road ?? address.pedestrian ?? address.footway ?? address.path;
  const houseNumber = findHouseNumber(address, displayParts);

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
