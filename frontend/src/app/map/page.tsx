"use client";

import { useState, useEffect } from "react";

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return (R * c).toFixed(1); // Distance in km
};

export default function MapPage() {
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [specialty, setSpecialty] = useState("all");

  // Step 1: Ask for user's location
  const getUserLocation = () => {
    setLoading(true);
    setError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          fetchHospitals(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError("Please enable location services to find nearby hospitals.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  // Step 2: Fetch free data from OpenStreetMap (Overpass API)
  const fetchHospitals = async (lat: number, lon: number) => {
    try {
      // Look for hospitals, clinics, and doctors within a 5km radius (5000 meters)
      const query = `
        [out:json];
        (
          node["amenity"~"hospital|clinic|doctors"](around:5000,${lat},${lon});
          way["amenity"~"hospital|clinic|doctors"](around:5000,${lat},${lon});
        );
        out center;
      `;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      // Clean up the data
      const results = data.elements
        .filter((el: any) => el.tags && el.tags.name) // Only keep places with actual names
        .map((el: any) => {
          const hospLat = el.lat || el.center?.lat;
          const hospLon = el.lon || el.center?.lon;
          return {
            id: el.id,
            name: el.tags.name,
            type: el.tags.amenity,
            specialtyTags: (el.tags['healthcare:speciality'] || "").toLowerCase() + " " + el.tags.name.toLowerCase(),
            lat: hospLat,
            lon: hospLon,
            distance: calculateDistance(lat, lon, hospLat, hospLon)
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance); // Sort by closest

      setHospitals(results);
    } catch (err) {
      setError("Failed to fetch hospital data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Filter hospitals based on the selected dropdown concern
  const filteredHospitals = hospitals.filter((h) => {
    if (specialty === "all") return true;
    if (specialty === "cardiac") return h.specialtyTags.includes("cardi") || h.specialtyTags.includes("heart");
    if (specialty === "neuro") return h.specialtyTags.includes("neuro") || h.specialtyTags.includes("brain");
    if (specialty === "derma") return h.specialtyTags.includes("derma") || h.specialtyTags.includes("skin");
    if (specialty === "pediatric") return h.specialtyTags.includes("pediatr") || h.specialtyTags.includes("child");
    if (specialty === "ortho") return h.specialtyTags.includes("ortho") || h.specialtyTags.includes("bone");
    if (specialty === "dental") return h.specialtyTags.includes("dent") || h.specialtyTags.includes("tooth") || h.specialtyTags.includes("teeth");
    if (specialty === "eye") return h.specialtyTags.includes("eye") || h.specialtyTags.includes("ophthal");
    if (specialty === "gynae") return h.specialtyTags.includes("gyn") || h.specialtyTags.includes("women") || h.specialtyTags.includes("matern");
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa]">
      {/* 1. MODERN HEADER: Gradient + Rounded Bottom + Soft Padding */}
      <section className="relative pt-20 pb-32 px-6 text-center text-white bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden shrink-0 w-full">
        {/* Optional: Subtle top glow effect for texture */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 animate-[fadeUp_0.6s_ease-out]">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-4xl drop-shadow-md">📍</span> Find Hospitals
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto font-medium">
            Locate hospitals and clinics near your current location.
          </p>
        </div>
      </section>

      {/* 2. THE OVERLAPPING CARD GRID: Negative Top Margin (-mt-20) + Soft Shadow */}
      <div className="max-w-3xl w-full mx-auto px-6 -mt-20 mb-20 relative z-20 flex-1 flex flex-col">
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[#1e293b] text-center mb-2">Nearby Hospitals</h2>
          <p className="text-[#475569] text-center mb-8">
            Choose a specialist and we'll show hospitals near you (with distance).
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="font-bold text-[#1e293b] text-sm md:text-base whitespace-nowrap">Select specialty</span>
            <select 
              value={specialty} 
              onChange={(e) => setSpecialty(e.target.value)}
              className="bg-white border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] transition-all min-w-[200px]"
            >
              <option value="all">General / All Facilities</option>
              <option value="cardiac">Cardiac / Heart</option>
              <option value="neuro">Neurology / Brain</option>
              <option value="derma">Dermatology / Skin Care</option>
              <option value="pediatric">Pediatrics / Children</option>
              <option value="ortho">Orthopedics / Bones</option>
              <option value="dental">Dental / Dentist</option>
              <option value="eye">Ophthalmology / Eye Care</option>
              <option value="gynae">Gynecology / Women's Health</option>
            </select>
            
            <button 
              onClick={getUserLocation}
              disabled={loading}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#94a3b8] disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              {loading ? "Locating..." : "Find Nearby"}
            </button>
          </div>
          
          {(!userLoc || filteredHospitals.length === 0) && !loading && !error && (
            <p className="text-sm text-[#64748b] mt-4">Please select a specialty to continue.</p>
          )}

          {/* Error Message */}
          {error && <div className="text-red-500 mt-4 text-sm font-medium">{error}</div>}

          {/* Results List */}
          <div className="w-full flex flex-col gap-4 mt-8">
            {!loading && userLoc && filteredHospitals.length === 0 && (
              <div className="text-center p-6 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-[#64748b]">
                No facilities found for this specific concern within 5km. Try changing the filter.
              </div>
            )}

            {filteredHospitals.map((hospital) => {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLoc?.lat},${userLoc?.lon}&destination=${hospital.lat},${hospital.lon}`;

              return (
                <div key={hospital.id} className="bg-white p-5 rounded-xl border border-[#e2e8f0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#0ea5e9]/30 hover:shadow-md transition-all">
                  <div>
                    <h3 className="text-lg font-bold text-[#1e293b]">{hospital.name}</h3>
                    <p className="text-[#64748b] capitalize text-sm">{hospital.type.replace('_', ' ')} • {hospital.distance} km away</p>
                  </div>
                  
                  <a 
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap text-sm"
                  >
                    Get Directions
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
