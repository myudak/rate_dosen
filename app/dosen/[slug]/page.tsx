import { DosenDetail } from "@/components/DosenDetail";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Detail ${params.slug} | Rate Dosen`,
    description:
      "Lihat detail rating, tingkat kesulitan, dan review mahasiswa untuk dosen pilihanmu.",
  };
}

export default function DosenDetailPage({ params }: PageProps) {
  return (
    <main className="min-h-screen w-full pt-24 sm:pt-28">
      <section className="px-4 pb-16 sm:px-6 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <DosenDetail slug={params.slug} />
        </div>
      </section>
    </main>
  );
}
