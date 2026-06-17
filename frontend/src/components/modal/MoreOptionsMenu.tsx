import { FiMapPin, FiFileText, FiTrendingUp, FiGrid, FiBell, FiLayers, FiGlobe, FiExternalLink, FiArrowUpRight } from 'react-icons/fi';
import { MdOutlineShowChart } from 'react-icons/md';
import { GrAttachment } from "react-icons/gr";

interface MoreOptionsMenuProps {
  onClose: () => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
}

function MenuItem({ icon, label, rightContent, onClick }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-black/5"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-[13px]" style={{ color: "#2b2f36" }}>
          {label}
        </span>
      </div>
      {rightContent}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{ backgroundColor: "#eef0f3", color: "#8a8f98" }}
    >
      {children}
    </span>
  );
}

const GRAY = "#5b6472";
const ORANGE = "#f5a623";
const BLUE = "#387ed1";

const Divider = () => <div className="my-1 border-t" style={{ borderColor: "#eef0f3" }} />;

export default function MoreOptionsMenu({ onClose }: MoreOptionsMenuProps) {
  return (
    <>
      {/* invisible full-screen layer to catch outside clicks and close the menu */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-lg py-1 w-[210px]"
        style={{ backgroundColor: "#ffffff", border: "1px solid #eef0f3" }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          icon={<GrAttachment size={14} color={GRAY} />}
          label="Pin"
          rightContent={
            <div className="flex items-center gap-1">
              <Badge>1</Badge>
              <Badge>2</Badge>
            </div>
          }
        />
        <MenuItem icon={<FiFileText size={14} color={GRAY} />} label="Notes" />

        <Divider />

        <MenuItem icon={<FiTrendingUp size={14} color={GRAY} />} label="Chart" rightContent={<FiExternalLink size={11} color={BLUE} />} />
        <MenuItem icon={<FiGrid size={14} color={GRAY} />} label="Option chain" rightContent={<FiExternalLink size={11} color={BLUE} />} />

        <Divider />

        <MenuItem icon={<FiBell size={14} color={ORANGE} />} label="Create alert / ATO" />
        <MenuItem icon={<FiLayers size={14} color={GRAY} />} label="Market depth" />

        <Divider />

        <MenuItem icon={<FiGlobe size={14} color={ORANGE} />} label="Fundamentals" rightContent={<FiArrowUpRight size={11} color={BLUE} />} />
        <MenuItem icon={<MdOutlineShowChart size={14} color={BLUE} />} label="Technicals" />
      </div>
    </>
  );
}