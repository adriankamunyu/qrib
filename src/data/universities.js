// Kenyan universities & institutions used to anchor listings/search/map
export const universities = [
  { id: "uon", name: "University of Nairobi", city: "Nairobi", lat: -1.2795, lng: 36.8172 },
  { id: "ku", name: "Kenyatta University", city: "Nairobi", lat: -1.1817, lng: 36.9346 },
  { id: "jkuat", name: "JKUAT (Juja)", city: "Kiambu", lat: -1.0956, lng: 37.0138 },
  { id: "strathmore", name: "Strathmore University", city: "Nairobi", lat: -1.3095, lng: 36.8118 },
  { id: "usiu", name: "USIU-Africa", city: "Nairobi", lat: -1.2196, lng: 36.8790 },
  { id: "mmu", name: "Multimedia University of Kenya", city: "Nairobi", lat: -1.3762, lng: 36.7481 },
  { id: "tuk", name: "Technical University of Kenya", city: "Nairobi", lat: -1.2833, lng: 36.8253 },
  { id: "moi", name: "Moi University", city: "Eldoret", lat: 0.2833, lng: 35.2903 },
  { id: "egerton", name: "Egerton University", city: "Njoro", lat: -0.3708, lng: 35.9351 },
  { id: "maseno", name: "Maseno University", city: "Maseno", lat: -0.0068, lng: 34.5997 },
];

export const getUniversity = (id) => universities.find((u) => u.id === id);
