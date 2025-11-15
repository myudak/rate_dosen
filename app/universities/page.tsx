import { UniversityList } from "@/components/UniversityList";

export const metadata = {
  title: "Universitas Terbaik | Rate Dosen",
  description:
    "Lihat peringkat dan statistik universitas berdasarkan rating dosen.",
};

export default function UniversitiesPage() {
  return (
    <main className="min-h-screen w-full pt-24 sm:pt-28">
      <section className="px-4 pb-16 sm:px-6 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
              Peringkat kampus
            </p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
              Rating universitas berdasar review dosen
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Perbandingkan jumlah dosen yang aktif dinilai serta kualitas
              rata-rata berdasarkan review mahasiswa.
            </p>
          </div>
          <UniversityList />
        </div>
      </section>
    </main>
  );
}
