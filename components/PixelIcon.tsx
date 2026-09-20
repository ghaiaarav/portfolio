export default function PixelIcon({ name, alt = "" }: { name: string; alt?: string }) {
  return <img className="mc-pixel-icon" src={`/textures/icons/${name}.png`} alt={alt} width={16} height={16} />;
}
