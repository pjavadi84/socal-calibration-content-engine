export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-3xl font-bold">
        SoCal Calibration Content Engine
      </h1>
      <p className="mb-8 text-gray-600">
        AI-powered SEO content generation for SoCal Calibration.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/api/articles"
          className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Articles API</h2>
          <p className="text-sm text-gray-500">
            GET /api/articles — List all generated articles
          </p>
        </a>
        <a
          href="/api/articles/generate"
          className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Generate Article</h2>
          <p className="text-sm text-gray-500">
            POST /api/articles/generate — Generate a new article
          </p>
        </a>
      </div>
    </main>
  );
}
