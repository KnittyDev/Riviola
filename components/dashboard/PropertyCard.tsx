import Image from "next/image";
import Link from "next/link";

export interface PropertyCardProps {
  id?: string;
  imageSrc: string;
  imageAlt: string;
  badge: string;
  title: string;
  location: string;
  progress: number;
  area?: string;
  updateTime: string;
  updateText: string;
}

export function PropertyCard({
  id,
  imageSrc,
  imageAlt,
  badge,
  title,
  location,
  progress,
  area,
  updateTime,
  updateText,
}: PropertyCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-[11px] font-bold rounded-lg uppercase tracking-wider">
            {badge}
          </span>
        </div>
      </div>
      <div className="p-5 pb-5">
        <h5 className="text-xl font-bold mb-1 text-gray-900">{title}</h5>
        <p className="text-gray-500 text-sm mb-4">{location}</p>
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-gray-700">
              Construction Progress
            </span>
            <span className="text-[#134e4a] font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#134e4a] h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {area != null && area !== "" && (
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Area</span>
            <span className="font-bold text-gray-900">{area}</span>
          </div>
        )}
        {id && (
          <Link
            href={`/dashboard/properties/${id}`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#134e4a] text-white text-sm font-bold hover:bg-[#115e59] transition-colors"
          >
            View details
            <i className="las la-arrow-right text-base" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
