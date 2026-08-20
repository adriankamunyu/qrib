import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function FitBounds({ listings }) {
  const map = useMap();
  useEffect(() => {
    if (!listings.length) return;
    const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [listings, map]);
  return null;
}

// Renders a price-pill marker, matching the teal/orange badges in the Figma map
function priceIcon(price, isActive) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${isActive ? "#f97316" : "#0d9488"};
      color:white;
      font-weight:600;
      font-size:12px;
      padding:6px 10px;
      border-radius:9999px;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      white-space:nowrap;
    ">KSh ${price.toLocaleString()}</div>`,
    iconSize: [0, 0],
  });
}

export default function MapView({ listings = [], activeId, onMarkerClick }) {
  const navigate = useNavigate();
  const center = listings.length
    ? [listings[0].lat, listings[0].lng]
    : [-1.286389, 36.817223]; // Nairobi fallback

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-gray-200">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds listings={listings} />

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={priceIcon(listing.price, listing.id === activeId)}
            eventHandlers={{
              click: () => {
                onMarkerClick?.(listing.id);
                navigate(`/accommodation/${listing.id}`);
              },
              mouseover: () => onMarkerClick?.(listing.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}