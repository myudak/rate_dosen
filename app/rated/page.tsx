import { DosenCardList } from "@/components/DosenCardList";

export const metadata = {
  title: "Daftar Rating Dosen | Rate Dosen",
  description:
    "Lihat daftar kartu dosen lengkap beserta kualitas, tingkat kesulitan, dan ulasan terbaru.",
};

export default function RatedPage() {
  return (
    <main className="min-h-screen w-full pt-24 sm:pt-28">
      <section className="px-4 pb-16 sm:px-6 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
              Feed rating
            </p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
              Semua dosen yang sudah dinilai
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Setiap kartu terhubung dengan halaman detail sehingga kamu bisa
              membaca review, statistik rating, dan pengalaman terbaru mahasiswa.
            </p>
          </div>
          <DosenCardList limit={40} />
        </div>
      </section>
    </main>
  );
}
