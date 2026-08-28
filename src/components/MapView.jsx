import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const uniIcon = new L.DivIcon({
  html: `<div style="background:#1e293b;color:white;font-size:10px;font-weight:700;padding:4px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25)">🎓 UNI</div>`,
  className: "",
  iconAnchor: [20, 10],
});

const listingIcon = (price) =>
  new L.DivIcon({
    html: `<div style="background:#0f766e;color:white;font-size:11px;font-weight:800;padding:5px 9px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)">KSh ${Number(
      price
    ).toLocaleString()}</div>`,
    className: "",
    iconAnchor: [30, 14],
  });

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export default function MapView({ listings = [], universities = [], center, zoom = 13, onSelect }) {
  const mapCenter = center || (listings[0] ? [listings[0].lat, listings[0].lng] : [-1.2833, 36.8172]);

  return (
    <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} className="rounded-xl">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} />
      {universities.map((u) => (
        <Marker key={u.id} position={[u.lat, u.lng]} icon={uniIcon}>
          <Popup>
            <strong>{u.name}</strong>
            <br />
            {u.city}, Kenya
          </Popup>
        </Marker>
      ))}
      {listings.map((l) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={listingIcon(l.pricePerMonth)}
          eventHandlers={{ click: () => onSelect && onSelect(l) }}
        >
          <Popup>
            <strong>{l.title}</strong>
            <br />
            {l.area}
            <br />
            KSh {l.pricePerMonth.toLocaleString()} / month
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
