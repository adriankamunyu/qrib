export const universities = [
  {
    id: "uon",
    name: "University of Nairobi",
    city: "Nairobi",
  },
  {
    id: "ku",
    name: "Kenyatta University",
    city: "Nairobi",
  },
  {
    id: "jkuat",
    name: "Jomo Kenyatta University of Agriculture and Technology",
    city: "Kiambu",
  },
  {
    id: "strathmore",
    name: "Strathmore University",
    city: "Nairobi",
  },
  {
    id: "usiu",
    name: "United States International University - Africa",
    city: "Nairobi",
  },
  {
    id: "moi",
    name: "Moi University",
    city: "Eldoret",
  },
  {
    id: "egerton",
    name: "Egerton University",
    city: "Njoro",
  },
];

export function getUniversity(id) {
  return universities.find((university) => university.id === id);
}
