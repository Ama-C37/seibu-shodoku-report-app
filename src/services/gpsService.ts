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
  error?: string;
};

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
  if (!data.display_name || data.error) {
    throw new Error('Address not found.');
  }
  return data.display_name;
}
