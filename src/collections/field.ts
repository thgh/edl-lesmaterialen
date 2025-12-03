import { TextareaField, TextField } from 'payload'

export const localize = <T extends TextField | TextareaField>(field: T) => {
  return {
    type: 'row' as const,
    fields: [
      {
        type: field.type,
        name: field.name + '_nl',
        label: field.label + ' (Nederlands)',
        admin: {
          ...field.admin,
          width: '50%',
        },
      } as T,
      {
        type: field.type,
        name: field.name + '_de',
        label: field.label + ' (Duits)',
        admin: {
          ...field.admin,
          width: '50%',
        },
      } as T,
    ],
  }
}

export const localizedTitle = localize({
  type: 'text',
  name: 'title',
  label: 'Titel',
})

export const hiddenTitle: TextField = {
  type: 'text',
  name: 'title',
  label: 'Titel',
  required: true,
  admin: { hidden: true },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const d = { ...originalDoc, ...data }
        return [d?.title_nl, d?.title_de].filter(Boolean).filter(uniq).join(' - ')
      },
    ],
  },
}

function uniq(value: string, index: number, self: string[]): boolean {
  return self.indexOf(value) === index
}
