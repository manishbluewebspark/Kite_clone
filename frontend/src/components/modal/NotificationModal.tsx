// src/components/modal/NotificationModal.tsx
export default function NotificationModal() {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-2xl shadow-xl  z-[9999]"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="p-4">
        <p className="text-sm leading-6 text-gray-600">
          Refer your friends and family to open a Zerodha account and earn 10%
          of the brokerage they generate, along with 300 reward points.
          <span className="text-blue-500 cursor-pointer ml-1">Read more.</span>
        </p>

        <p className="text-xs mt-3 text-right text-gray-400">a day ago</p>
      </div>
    </div>
  );
}