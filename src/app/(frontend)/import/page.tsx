import { Metadata } from 'next'
import ImportXLSXPage from './ImportXLSXPage'

export const metadata: Metadata = {
  title: 'Import lesmaterialen',
  description: 'Import lesmaterialen',
}

export default function Page() {
  return <ImportXLSXPage />
}
