import { createTaxonomy } from './taxonomy'

export const MaterialTypes = createTaxonomy({
  slug: 'material-types',
  labels: {
    singular: 'Materiaalsoort',
    plural: 'Materiaalsoorten',
  },
})
