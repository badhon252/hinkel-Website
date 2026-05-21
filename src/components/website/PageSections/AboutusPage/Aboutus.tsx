interface AboutusProps {
  title?: string;
  content?: string;
}

const Aboutus = ({ title, content }: AboutusProps) => {
  if (!title || !content) {
    return (
      <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-600">
            Failed to load content
          </h2>
          <p className="text-gray-500 mt-2">Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-secondary flex justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-gray-700">
        <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-600 mb-8">
          {title}
        </h1>

        <div
          className="content-prose prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};

export default Aboutus;
