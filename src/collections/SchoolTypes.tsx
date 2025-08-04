import { createTaxonomy } from "./taxonomy";

export const SchoolTypes = createTaxonomy({
  slug: 'school-types',
  labels: {
    singular: 'Schooltype',
    plural: 'Schooltypes',
  },
})
