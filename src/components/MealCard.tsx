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
      className="glass glass-card group block rounded-[16px] overflow-hidden
                 motion-safe:transition-all motion-safe:duration-300
                 motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={thumb}
          alt={name}
          className="w-full h-full object-cover
                     motion-safe:transition-transform motion-safe:duration-500
                     motion-safe:group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                        opacity-0 motion-safe:transition-opacity motion-safe:duration-300
                        group-hover:opacity-100" />
      </div>
      <p className="px-3 py-3 text-sm font-medium leading-snug line-clamp-2
                    text-[#BDBDBD] group-hover:text-white
                    motion-safe:transition-colors motion-safe:duration-200">
        {name}
      </p>
    </Link>
  )
}
