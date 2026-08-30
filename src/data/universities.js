export const universities = [
  {
    dbId: 1,
    id: "uon",
    name: "University of Nairobi",
    city: "Nairobi",
  },
  {
    dbId: 2,
    id: "ku",
    name: "Kenyatta University",
    city: "Nairobi",
  },
  {
    dbId: 3,
    id: "jkuat",
    name: "Jomo Kenyatta University of Agriculture and Technology",
    city: "Kiambu",
  },
  {
    dbId: 4,
    id: "strathmore",
    name: "Strathmore University",
    city: "Nairobi",
  },
  {
    dbId: 5,
    id: "usiu",
    name: "United States International University - Africa",
    city: "Nairobi",
  },
  {
    dbId: 6,
    id: "moi",
    name: "Moi University",
    city: "Eldoret",
  },
  {
    dbId: 7,
    id: "egerton",
    name: "Egerton University",
    city: "Njoro",
  },
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
