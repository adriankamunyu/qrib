export const universities = [
  { dbId: 1, id: "uon", name: "University of Nairobi", city: "Nairobi" },
  { dbId: 2, id: "ku", name: "Kenyatta University", city: "Nairobi" },
  { dbId: 3, id: "jkuat", name: "Jomo Kenyatta University of Agriculture and Technology", city: "Kiambu" },
  { dbId: 4, id: "strathmore", name: "Strathmore University", city: "Nairobi" },
  { dbId: 5, id: "usiu", name: "United States International University - Africa", city: "Nairobi" },
  { dbId: 6, id: "moi", name: "Moi University", city: "Eldoret" },
  { dbId: 7, id: "egerton", name: "Egerton University", city: "Njoro" },
  { dbId: 8, id: "maseno", name: "Maseno University", city: "Kisumu" },
  { dbId: 9, id: "kisii", name: "Kisii University", city: "Kisii" },
  { dbId: 10, id: "maasai-mara", name: "Maasai Mara University", city: "Narok" },
  { dbId: 11, id: "mount-kenya", name: "Mount Kenya University", city: "Thika" },
  { dbId: 12, id: "daystar", name: "Daystar University", city: "Nairobi" },
  { dbId: 13, id: "cuea", name: "Catholic University of Eastern Africa", city: "Nairobi" },
  { dbId: 14, id: "africa-nazarene", name: "Africa Nazarene University", city: "Nairobi" },
  { dbId: 15, id: "university-of-embu", name: "University of Embu", city: "Embu" },
  { dbId: 16, id: "dedan-kimathi", name: "Dedan Kimathi University of Technology", city: "Nyeri" },
  { dbId: 17, id: "tuk", name: "Technical University of Kenya", city: "Nairobi" },
  { dbId: 18, id: "multimedia", name: "Multimedia University of Kenya", city: "Nairobi" },
  { dbId: 19, id: "kca", name: "KCA University", city: "Nairobi" },
  { dbId: 20, id: "riara", name: "Riara University", city: "Nairobi" },
  { dbId: 21, id: "st-pauls", name: "St. Paul’s University", city: "Limuru" },
  { dbId: 22, id: "uoeld", name: "University of Eldoret", city: "Eldoret" },
  { dbId: 23, id: "machakos", name: "Machakos University", city: "Machakos" },
  { dbId: 24, id: "nakuru", name: "Nakuru University", city: "Nakuru" },
  { dbId: 25, id: "meru", name: "Meru University of Science and Technology", city: "Meru" },
  { dbId: 26, id: "mku", name: "Murang’a University of Technology", city: "Murang’a" },
  { dbId: 27, id: "cooperative", name: "Co-operative University of Kenya", city: "Nairobi" },
  { dbId: 28, id: "karatina", name: "Karatina University", city: "Karatina" },
];

export function resolveUniversityId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericId = Number(value);
  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  const selected = universities.find(
    (university) => university.id === String(value).toLowerCase()
  );

  return selected ? selected.dbId : null;
}

export function getUniversity(id) {
  const numericId = Number(id);

  return universities.find(
    (university) =>
      university.id === String(id).toLowerCase() ||
      university.dbId === numericId ||
      university.id === id
  );
}
