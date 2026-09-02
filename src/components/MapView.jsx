import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const cityCoordinates = {
  Nairobi: [-1.286389, 36.817223],
  Eldoret: [0.514277, 35.269779],
  Kiambu: [-1.17139, 36.83556],
  Njoro: [-0.33083, 35.94444],
  Kisumu: [-0.10221, 34.76171],
  Kisii: [-0.67396, 34.78088],
  Narok: [-1.08333, 35.86722],
  Thika: [-1.03326, 37.06933],
  Embu: [-0.53111, 37.45444],
  Nyeri: [-0.41667, 36.94722],
  Machakos: [-1.51667, 37.26667],
  Nakuru: [-0.3031, 36.08003],
  Meru: [0.0462, 37.6553],
  "Murang'a": [-0.721, 37.1526],
  Limuru: [-1.10466, 36.63798],
  Karatina: [-0.483, 37.1324],
  Mombasa: [-4.04348, 39.66821],
  "Nairobi West": [-1.2995, 36.8190],
  Westlands: [-1.264, 36.8025],
  Kasarani: [-1.215, 36.894],
  Kilimani: [-1.287, 36.789],
};

export default function MapView({ listings = [] }) {
  const first = listings[0];
  const center = cityCoordinates[first?.city] || cityCoordinates.Nairobi;

  return (
    <div className="h-[620px] w-full overflow-hidden rounded-2xl border border-line bg-slate-100 shadow-sm">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {listings.map((listing) => {
          const coords = cityCoordinates[listing.city] || cityCoordinates.Nairobi;

          return (
            <Marker key={listing.id} position={coords}>
              <Popup>
                <div className="text-sm">
                  <strong className="block">{listing.title}</strong>
                  <span className="block text-xs text-slate-600">{listing.city}</span>
                  <span className="mt-1 block font-semibold text-slate-900">
                    KSh {Number(listing.pricePerMonth || 0).toLocaleString()} / month
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
