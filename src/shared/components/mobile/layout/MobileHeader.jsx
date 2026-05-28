export default function MobileHeader({ title, showBack = false }) {
  return (
    <header className="flex items-center py-4 mb-2">
      {/* Jika ingin menambahkan tombol back, bisa di sini */}
      {showBack && (
        <button className="mr-3 p-1 rounded-full hover:bg-zinc-200">
          {/* Tambahkan ikon chevron-left di sini */}
        </button>
      )}
      
      <h1 className="text-xl font-bold text-zinc-900 m-0">
        {title}
      </h1>
    </header>
  );
}
