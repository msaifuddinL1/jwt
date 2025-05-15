import dayjs from "dayjs";

interface ChipType {
  title?: string;
  number: number;
}
export default function TimeChip(props: ChipType) {
  // Convert Unix timestamp in seconds to a formatted date/time
  const convertUnixTimestamp = (timestamp:number) => {
    // Multiply by 1000 to convert seconds to milliseconds
    const date = dayjs.unix(timestamp);

    // Format the date (you can customize the format as needed)
    return date.format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <div className="border-surface2 w-fit rounded-full border-2 px-3 py-2">
      <p><span className="text-lavender">{props.title}</span>{convertUnixTimestamp(props.number)}</p>
    </div>
  );
}
