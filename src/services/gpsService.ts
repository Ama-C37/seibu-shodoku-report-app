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
