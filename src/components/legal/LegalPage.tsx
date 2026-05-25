type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalPage({
  title,
  description,
  updatedAt,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen px-5 pt-8 pb-6 bg-white">
      <div className="mx-auto max-w-[680px]">
        <p className="text-[12px] font-semibold text-blue-deepest">
          신혼생활
        </p>
        <h1 className="mt-2 text-[26px] font-bold leading-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-ink-soft wb-keep">
          {description}
        </p>
        <p className="mt-4 text-[12px] text-mute">시행일: {updatedAt}</p>

        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[17px] font-semibold text-ink">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-[14px] leading-7 text-ink-soft wb-keep">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default LegalPage;
