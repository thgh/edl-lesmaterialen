import { Fragment } from 'react'

// Helper function to convert words containing "@" into mailto links and URLs into clickable links
export function renderTextWithEmailLinks(text: string) {
  const words = text.split(/(\s+)/)
  return words.map((word, index) => {
    const trimmedWord = word.trim()
    // Check if it's a URL (starts with http:// or https://)
    if (trimmedWord.startsWith('http://') || trimmedWord.startsWith('https://')) {
      return (
        <a
          key={index}
          href={trimmedWord}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline whitespace-nowrap"
        >
          {word}
        </a>
      )
    }
    // Check if it's an email address (contains @)
    if (trimmedWord.includes('@')) {
      // Strip trailing punctuation (e.g., period at end of sentence) from mailto link
      const match = trimmedWord.match(/^(.+?)([.,;:)\]>]+)$/)
      const emailPart = match ? match[1] : trimmedWord
      const trailingPunctuation = match ? match[2] : ''

      return (
        <Fragment key={index}>
          <a
            href={`mailto:${emailPart}`}
            className="text-blue-600 hover:underline whitespace-nowrap"
          >
            {emailPart}
          </a>
          {trailingPunctuation}
        </Fragment>
      )
    }
    return <Fragment key={index}>{word}</Fragment>
  })
}
