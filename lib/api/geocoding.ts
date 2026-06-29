export async function searchCity(city: string) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city,
    )}&count=1&language=it`,
  );

  if (!response.ok) {
    throw new Error("Geocoding error");
  }

  const data = await response.json();

  if (!data.results?.length) {
    throw new Error("City not found");
  }

  return data.results[0];
}
