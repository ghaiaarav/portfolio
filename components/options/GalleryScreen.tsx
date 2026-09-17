import McMenuScreen from "@/components/mc/McMenuScreen";

const PHOTO_SLOTS = ["Portrait", "Research", "Projects", "Piano", "Travel", "Side Quests"];

export default function GalleryScreen() {
  return (
    <McMenuScreen title="Photos & Videos" doneHref="/options" wide>
      <div className="mc-gallery">
        <p className="mc-gallery__intro">
          Gallery slots are ready. Add media when available.
        </p>
        <div className="mc-gallery__grid">
          {PHOTO_SLOTS.map((label, index) => (
            <div className="mc-gallery__slot" key={label}>
              <span className="mc-gallery__placeholder" aria-hidden="true">
                ▧
              </span>
              <span>{String(index + 1).padStart(2, "0")} · {label}</span>
            </div>
          ))}
          <div className="mc-gallery__slot mc-gallery__slot--video">
            <span className="mc-gallery__placeholder" aria-hidden="true">▶</span>
            <span>Video · Featured</span>
          </div>
          <div className="mc-gallery__slot mc-gallery__slot--video">
            <span className="mc-gallery__placeholder" aria-hidden="true">▶</span>
            <span>Video · More</span>
          </div>
        </div>
      </div>
    </McMenuScreen>
  );
}
