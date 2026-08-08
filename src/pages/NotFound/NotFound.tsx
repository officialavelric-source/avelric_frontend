export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="label text-warmgray">404</p>
      <h1 className="mt-4 font-display text-4xl">This page doesn't exist</h1>
      <a href="/" className="label mt-8 inline-block rounded-full bg-softblack px-8 py-4 text-[12px] text-ivory">Back home</a>
    </div>
  );
}
