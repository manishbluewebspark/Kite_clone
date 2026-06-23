import { FiFileText, FiTrendingUp, FiExternalLink, FiBell } from 'react-icons/fi';
import { GrAttachment } from "react-icons/gr";
import { AiOutlineAlignCenter } from 'react-icons/ai';
import { BsArrowsAngleExpand, BsCart2 } from 'react-icons/bs';


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



function OptionChainIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* Left aligned */}
      <rect x="4" y="4" width="5" height="1.5" rx="0.75" fill={color} />
      <rect x="2" y="8" width="9" height="1.5" rx="0.75" fill={color} />

      {/* Center longest */}
      <rect x="1" y="12" width="18" height="1.5" rx="0.75" fill={color} />

      {/* Right aligned */}
      <rect x="10" y="16" width="9" height="1.5" rx="0.75" fill={color} />
      <rect x="13" y="20" width="5" height="1.5" rx="0.75" fill={color} />
    </svg>
  );
}

const GRAY = "#5b6472";
// const ORANGE = "#f5a623";
// const BLUE = "#387ed1";

const Divider = () => <div className="my-1 border-t" style={{ borderColor: "#eef0f3" }} />;

export default function MoreOptionsMenu({ onClose }: MoreOptionsMenuProps) {
  return (
    <>
      {/* invisible full-screen layer to catch outside clicks and close the menu */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />

      <div
        className="absolute right-0 top-full mt-1 z-[100] rounded-lg shadow-lg py-1 w-[210px]"
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

        <MenuItem
          icon={<FiTrendingUp size={14} color={GRAY} />}
          label="Chart"
          rightContent={
            <div className="flex items-center justify-center w-5 h-5 rounded-sm bg-blue-100 shrink-0">
              <FiExternalLink size={10} className="text-blue" />
            </div>
          }
        />

        <MenuItem
          icon={<OptionChainIcon size={14} color={GRAY} />}
          label="Option chain"
          rightContent={
            <div className="flex items-center justify-center w-5 h-5 rounded-sm bg-blue-100 shrink-0">
              <FiExternalLink size={10} className="text-blue" />
            </div>
          }
        />

        <Divider />
        <MenuItem
  icon={
    <img
      src="./gtt.png"
      alt="GTT"
      className="w-4 h-4 object-contain"
    />
  }
  label="Create GTT / GTC"
/>
        <MenuItem icon={<FiBell size={14} color={GRAY} />} label="Create alert / ATO" />
        <MenuItem icon={<AiOutlineAlignCenter style={{ rotate: "180deg" }} size={14} color={GRAY} />} label="Market depth" />
        <MenuItem icon={<BsCart2 size={14} color={GRAY} />} label="Add to basket" />

        <Divider />

        <MenuItem
          icon={<img src='./fundamental.png' alt='fundamental' className="w-4 h-4 object-contain" />}
          label="Fundamentals"
          rightContent={
            <div className="flex items-center justify-center w-5 h-5 rounded-sm bg-blue-100 shrink-0">
              <BsArrowsAngleExpand size={11} className="text-blue" />
            </div>
          }
        />
        <MenuItem icon={<img src='./technicals.avif' alt='technicals' className="w-4 h-4 object-contain" />} label="Technicals" />
      </div>
    </>
  );
}