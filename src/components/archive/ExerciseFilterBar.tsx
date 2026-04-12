interface Props {
  allTags: string[]
  totalCount: number
  filterTag: string
  onFilterChange: (tag: string) => void
}

export function ExerciseFilterBar({ allTags, totalCount, filterTag, onFilterChange }: Props) {
  if (allTags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onFilterChange('')}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          !filterTag ? 'bg-accent text-white' : 'bg-elevated text-muted hover:text-primary'
        }`}
      >
        Alle ({totalCount})
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onFilterChange(tag === filterTag ? '' : tag)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            filterTag === tag
              ? 'bg-accent text-white'
              : 'bg-elevated text-muted hover:text-primary'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
