import { Link } from 'react-router-dom'

interface MealCardProps {
  id: string
  name: string
  thumb: string
}

export default function MealCard({ id, name, thumb }: MealCardProps) {
  return (
    <Link to={`/meal/${id}`} className="block">
      <img src={thumb} alt={name} className="w-full" />
      <p>{name}</p>
    </Link>
  )
}
