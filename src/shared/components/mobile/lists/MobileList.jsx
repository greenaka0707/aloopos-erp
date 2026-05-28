export default function MobileList({
  children,
  spacing = "space-y-2", // Default lebih rapat (8px) daripada space-y-4 (16px)
}) {
  return (
    <div className={`flex flex-col ${spacing}`}>
      {children}
    </div>
  );
}
