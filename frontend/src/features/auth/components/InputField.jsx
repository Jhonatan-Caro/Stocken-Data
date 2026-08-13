export default function InputField({ icon, error, ...props }) {
  return (
    <div>
      <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm px-3 focus-within:ring-2 focus-within:ring-indigo-500">
        {icon}
        <input {...props} className="w-full py-2 outline-none" />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
