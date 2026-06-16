import { useState } from "react";
import { useAddUser } from "../../hooks/useUserHook";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AddUsers() {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    email: "",
    apiKey: "",
    secretKey: "",
    accountType: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { mutate: addUser, isPending, error } = useAddUser();

  const accountOptions = [
    { value: "coindcx", label: "CoinDCX" },
    { value: "binance", label: "Binance" },
    { value: "wazirx", label: "WazirX" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectAccount = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      accountType: value,
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();
    
    addUser({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile || undefined,
      address: formData.address || undefined,
      apiKey: formData.apiKey || undefined,
      secretKey: formData.secretKey || undefined,
      accountType: formData.accountType || undefined,
    }, {
      onSuccess: () => {
        toast.success("User added successfully!");
        setFormData({
          name: "", mobile: "", address: "", email: "", 
          apiKey: "", secretKey: "", accountType: ""
        });
        setIsDropdownOpen(false);
        setTimeout(() => navigate("/users"), 2000);
      },
      onError: (err) => {
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to add user";
        toast.error(errorMessage, { autoClose: 5000 });
      }
    });
  };

  const getSelectedLabel = () => {
    const selected = accountOptions.find(opt => opt.value === formData.accountType);
    return selected ? selected.label : "Select Account";
  };

  return (
    <div className="p-6 bg-white ">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Add User</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block mb-2 text-[12px] font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            required
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block mb-2 text-[12px] font-medium text-gray-700">Mobile Number</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="+91 12345 67890"
            className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 text-[12px] font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            required
          />
        </div>


        {/* Address */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-[12px] font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter complete address"
            className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            rows={3}
          />
        </div>



        {/* Submit Button */}
        <div className="md:col-span-2 mt-6">
          <button
            type="submit"
            disabled={isPending || !formData.name || !formData.email}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md text-[12px] font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
}