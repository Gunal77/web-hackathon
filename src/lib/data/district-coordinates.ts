/**
 * Tamil Nadu district center coordinates for map pan/zoom.
 * Default view: full Tamil Nadu (lat: 11.1271, lng: 78.6569, zoom: 7).
 * Selected district: zoom 10 with smooth animation.
 */

export const TAMIL_NADU_DEFAULT = {
  lat: 11.1271,
  lng: 78.6569,
  zoom: 7
} as const;

export const SELECTED_DISTRICT_ZOOM = 10;

export const districtCoordinates: Record<string, { lat: number; lng: number }> = {
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Salem: { lat: 11.6643, lng: 78.146 },
  Ariyalur: { lat: 11.1378, lng: 79.0759 },
  Chengalpattu: { lat: 12.6981, lng: 79.9896 },
  Cuddalore: { lat: 11.7447, lng: 79.768 },
  Dharmapuri: { lat: 12.1271, lng: 78.155 },
  Dindigul: { lat: 10.3673, lng: 77.9803 },
  Erode: { lat: 11.3463, lng: 77.731 },
  Kallakurichi: { lat: 11.7341, lng: 78.9592 },
  Kancheepuram: { lat: 12.8342, lng: 79.7036 },
  Karur: { lat: 10.9601, lng: 78.0767 },
  Krishnagiri: { lat: 12.5186, lng: 78.2137 },
  Mayiladuthurai: { lat: 11.1031, lng: 79.655 },
  Nagapattinam: { lat: 10.7669, lng: 79.843 },
  Namakkal: { lat: 11.2224, lng: 78.167 },
  Nilgiris: { lat: 11.3811, lng: 76.6946 },
  Perambalur: { lat: 11.234, lng: 78.8762 },
  Pudukkottai: { lat: 10.3803, lng: 78.8214 },
  Ramanathapuram: { lat: 9.3833, lng: 78.8333 },
  Ranipet: { lat: 12.9342, lng: 79.3643 },
  Sivagangai: { lat: 9.8432, lng: 78.4808 },
  Tenkasi: { lat: 8.9544, lng: 77.3153 },
  Thanjavur: { lat: 10.7852, lng: 79.1391 },
  Theni: { lat: 10.0104, lng: 77.4798 },
  Thoothukudi: { lat: 8.7461, lng: 78.023 },
  Tirunelveli: { lat: 8.7139, lng: 77.7567 },
  Tirupattur: { lat: 12.4974, lng: 78.5599 },
  Tiruppur: { lat: 11.1085, lng: 77.3411 },
  Tiruvallur: { lat: 13.1322, lng: 79.9089 },
  Tiruvannamalai: { lat: 12.2276, lng: 79.0626 },
  Tiruvarur: { lat: 10.7723, lng: 79.6368 },
  Vellore: { lat: 12.9165, lng: 79.1325 },
  Villupuram: { lat: 11.9397, lng: 79.4921 },
  Virudhunagar: { lat: 9.4731, lng: 77.958 },
  Kanyakumari: { lat: 8.0863, lng: 77.5385 }
};

export function getDistrictCenter(district: string): { lat: number; lng: number } {
  return districtCoordinates[district] ?? TAMIL_NADU_DEFAULT;
}
