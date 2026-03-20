import { Asset, ProductCategory } from "@/lib/assets";
import { Link } from "@/i18n/routing";

interface AssetCardProps {
  asset: Asset;
  /** Optional: compact mode for smaller grids */
  compact?: boolean;
}

// Product category to color mapping
const categoryColorMap: Record<ProductCategory, string> = {
  "Domains": "#2CADB2",
  "Logo": "#8B5CF6",
  "Email": "#3B82F6",
  "SSL": "#10B981",
  "Website": "#F59E0B",
  "Ecommerce": "#F97316",
  "Online Fax": "#78716C",
  "Directory Listings": "#EC4899",
  "Reputation Management": "#14B8A6",
};

// Content type to Font Awesome 6 Solid icon mapping
const contentTypeIcon: Record<string, string> = {
  "Video": "fa-solid fa-video",
  "Presentation": "fa-solid fa-chart-bar",
  "Document": "fa-solid fa-file-pdf",
  "Case Study": "fa-solid fa-file-lines",
  "Playbook": "fa-solid fa-book",
  "Training": "fa-solid fa-graduation-cap",
  "Tool": "fa-solid fa-wrench",
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

export function AssetCard({ asset, compact = false }: AssetCardProps) {
  const borderColor = categoryColorMap[asset.productCategory];
  const icon = contentTypeIcon[asset.contentType] || "fa-solid fa-file";

  return (
    <Link href={`/assets/${asset.slug}`}>
      <div
        className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
          compact ? "p-4" : "p-5"
        }`}
        style={{
          borderTop: `6px solid ${borderColor}`,
        }}
      >
        {/* Top badges */}
        <div className="flex gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "#d1f0ee", color: "#0f766e" }}>
            {asset.productCategory}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <i className={`${icon} text-[9px]`} />
            {asset.contentType}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-heading font-bold text-gray-900 line-clamp-2 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {asset.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-body">
          {asset.summaryWhat}
        </p>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-body">
            {formatDate(asset.lastUpdated)}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 inline-flex items-center gap-1">
              <i className="fa-solid fa-eye text-[9px]" /> {asset.viewCount}
            </span>
            <span className="text-gray-400 inline-flex items-center gap-1">
              <i className="fa-solid fa-download text-[9px]" /> {asset.downloadCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
