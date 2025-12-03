import { createTaxonomy } from './taxonomy'

export const Topics = createTaxonomy({
  slug: 'topics',
  labels: {
    singular: 'Onderwerp',
    plural: "Onderwerpen / thema's",
  },
})
