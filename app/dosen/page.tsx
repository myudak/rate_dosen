import { DosenSearchPanel, type DosenTabId } from "@/components/DosenSearchPanel";

export const metadata = {
  title: "Top Dosen | Rate Dosen",
  description:
    "Cari, jelajahi, dan bagikan rating dosen yang telah dinilai oleh mahasiswa lain.",
};

type PageProps = {
  searchParams?: {
    tab?: string;
  };
};

export default function DosenPage({ searchParams }: PageProps) {
  const tabParam = (searchParams?.tab as DosenTabId | undefined) ?? "search";
  return (
    <main className="min-h-screen w-full pt-24 sm:pt-28">
      <section className="relative w-full px-4 pb-16 sm:px-6 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500 dark:text-blue-300">
              Top dosen
            </p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
              Jelajahi rating dosen terbaik
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Gunakan panel tab untuk mencari dosen, lihat daftar rating dalam
              format kartu, atau kirim pengalamanmu agar mahasiswa lain bisa
              mendapatkan insight yang relevan.
            </p>
          </div>
          <DosenSearchPanel initialTab={tabParam} />
        </div>
      </section>
    </main>
  );
}
