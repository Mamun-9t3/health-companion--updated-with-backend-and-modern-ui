"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyHospitals = void 0;
// Uses Overpass API (OpenStreetMap) to find nearest hospitals
// It doesn't require an API key and is good for getting started
const getNearbyHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
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
        const response = yield fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const data = yield response.json();
        const hospitals = data.elements.map((el) => {
            var _a, _b, _c, _d, _e;
            return ({
                id: el.id,
                name: ((_a = el.tags) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Hospital',
                lat: el.lat || ((_b = el.center) === null || _b === void 0 ? void 0 : _b.lat),
                lng: el.lon || ((_c = el.center) === null || _c === void 0 ? void 0 : _c.lon),
                address: ((_d = el.tags) === null || _d === void 0 ? void 0 : _d['addr:street']) || 'Address unknown',
                phone: ((_e = el.tags) === null || _e === void 0 ? void 0 : _e.phone) || 'No phone provided',
            });
        });
        res.json(hospitals);
    }
    catch (error) {
        console.error('Overpass API Error:', error);
        res.status(500).json({ message: 'Server error finding hospitals' });
    }
});
exports.getNearbyHospitals = getNearbyHospitals;
