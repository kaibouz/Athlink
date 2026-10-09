/**
 * Demo clips bundled with the app (public/media/demo), cut from
 * public/videos/baseball-pitch.mp4.
 *
 * These used to point at Google's public sample-video bucket and Unsplash
 * photos; the videos now return 403 and most photos 404, which left the feed,
 * composer and AI breakdown demo with black, unplayable cards. Serving them
 * from our own origin keeps demos working offline and on stage.
 */
export type DemoClip = { id: string; url: string; poster: string };

const clip = (id: string): DemoClip => ({
  id,
  url: `/media/demo/${id}.mp4`,
  poster: `/media/demo/${id}.jpg`,
});

export const DEMO_CLIPS = {
  windup: clip("pitch-windup"),
  release: clip("pitch-release"),
  fielding: clip("fielding-ready"),
  glove: clip("glove-work"),
} as const;
