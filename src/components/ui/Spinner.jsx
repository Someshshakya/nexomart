import './ui.css'

export default function Spinner({ size = 'md', color = 'brand' }) {
  return <span className={`ui-spinner ui-spinner-${size} ui-spinner-${color}`} aria-hidden />
}
