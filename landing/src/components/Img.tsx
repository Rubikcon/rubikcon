interface ImgPlaceholderProps {
  label: string
  className?: string
  aspect?: string
}

export default function Img({ label, className = '', aspect = 'aspect-video' }: ImgPlaceholderProps) {
  return (
    <div className={`img-placeholder rounded-xl ${aspect} ${className}`}>
      <div className="p-3">
        <div className="text-[#F5C518] text-xs font-mono mb-1">[ IMAGE ]</div>
        <div className="text-[#888888] text-[10px] leading-snug">{label}</div>
      </div>
    </div>
  )
}
