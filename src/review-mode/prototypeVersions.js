export const PROTOTYPE_VERSIONS = [
  {
    id: "v1",
    label: "Prototype — Version 1",
    homeHash: "#/",
  },
];

export function getVersionById(id) {
  return PROTOTYPE_VERSIONS.find((v) => v.id === id) ?? PROTOTYPE_VERSIONS[0];
}
