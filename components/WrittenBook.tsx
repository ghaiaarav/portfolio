import ReactMarkdown from "react-markdown";

interface WrittenBookProps {
  content: string;
}

export default function WrittenBook({ content }: WrittenBookProps) {
  return (
    <div className="written-book">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
