import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const cityCoordinates = {
  Nairobi: [-1.286389, 36.817223],
  Eldoret: [0.514277, 35.269779],
  Kiambu: [-1.17139, 36.83556],
  Njoro: [-0.33083, 35.94444],
};

export default function MapView({ listings = [] }) {
  const first = listings[0];
  const center =
    cityCoordinates[first?.city] || cityCoordinates.Nairobi;

  return (
    <div className="h-[520px] rounded-2xl overflow-hidden border border-line">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {listings.map((listing) => {
          const coords =
            cityCoordinates[listing.city] || cityCoordinates.Nairobi;

          return (
            <Marker key={listing.id} position={coords}>
              <Popup>
                <strong>{listing.title}</strong>
                <br />
                KSh {listing.pricePerMonth.toLocaleString()} / month
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
