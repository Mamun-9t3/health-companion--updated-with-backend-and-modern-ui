import { Request, Response } from 'express';

// Uses Overpass API (OpenStreetMap) to find nearest hospitals
// It doesn't require an API key and is good for getting started
export const getNearbyHospitals = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    // Bounding box for ~10km radius
    const delta = 0.1;
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="hospital"](${latitude - delta},${longitude - delta},${latitude + delta},${longitude + delta});
        way["amenity"="hospital"](${latitude - delta},${longitude - delta},${latitude + delta},${longitude + delta});
        relation["amenity"="hospital"](${latitude - delta},${longitude - delta},${latitude + delta},${longitude + delta});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await response.json();

    const hospitals = data.elements.map((el: any) => ({
      id: el.id,
      name: el.tags?.name || 'Unknown Hospital',
      lat: el.lat || el.center?.lat,
      lng: el.lon || el.center?.lon,
      address: el.tags?.['addr:street'] || 'Address unknown',
      phone: el.tags?.phone || 'No phone provided',
    }));

    res.json(hospitals);
  } catch (error) {
    console.error('Overpass API Error:', error);
    res.status(500).json({ message: 'Server error finding hospitals' });
  }
};
