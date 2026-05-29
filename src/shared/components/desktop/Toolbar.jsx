export default function Toolbar({
  left,
  right,
}) {
  return (
    <div
      className="
        mb-4
        flex
        items-center
        justify-between
        gap-3
      "
    >
      <div className="flex items-center gap-2">
        {left}
      </div>

      <div className="flex items-center gap-2">
        {right}
      </div>
    </div>
  );
}
