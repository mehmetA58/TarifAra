import { Link } from 'react-router-dom'

interface MealCardProps {
  id: string
  name: string
  thumb: string
}

export default function MealCard({ id, name, thumb }: MealCardProps) {
  return (
    <Link
      to={`/meal/${id}`}
      className="block rounded-xl overflow-hidden shadow-sm bg-white dark:bg-stone-800 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5"
    >
      <img
        src={thumb}
        alt={name}
        className="aspect-video object-cover w-full"
        loading="lazy"
      />
      <p className="px-3 py-2.5 text-sm font-medium leading-snug line-clamp-2 text-stone-800 dark:text-stone-100">
        {name}
      </p>
    </Link>
  )
}
