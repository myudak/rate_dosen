import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { DocActionBar } from "@/app/panduan/_components/DocActionBar";

const heroDescription =
  "Baca dulu sebelum kirim review: jaga sopan santun, hormati privasi, dan patuhi ketentuan hukum yang berlaku di Indonesia.";

const sections = [
  {
    title: "Cara kerja",
    items: [
      "Setiap review bisa dibaca moderator sebelum/ setelah tayang. Konten yang melanggar panduan, hukum Indonesia, atau berpotensi membahayakan akan diedit atau dihapus.",
      "Satu akun cuma boleh kirim satu review per dosen per mata kuliah supaya penilaian tetap adil dan tidak dimanipulasi.",
      "Platform ini bukan kanal resmi untuk laporan darurat, kekerasan, atau dugaan tindak pidana. Untuk keadaan darurat, segera hubungi pihak kampus, polisi, atau layanan bantuan terdekat.",
    ],
  },
  {
    title: "Yang boleh",
    items: [
      "Tulis pengalamanmu dengan jujur, seimbang, dan berdasarkan apa yang benar-benar kamu alami (bukan sekadar cerita dari orang lain).",
      "Fokus ke hal akademik: gaya mengajar, kejelasan materi, jenis tugas/kuis, cara memberi nilai, kebijakan hadir, dan tips lulus.",
      "Gunakan bahasa yang sopan dan mudah dipahami supaya review berguna buat mahasiswa lain yang lagi pilih dosen/mata kuliah.",
      "Kalau mengkritik, arahkan ke perilaku atau kebijakan di kelas, bukan ke fisik atau kehidupan pribadi dosen.",
    ],
  },
  {
    title: "Yang dilarang",
    items: [
      "Kata kasar, hinaan, ujaran kebencian, atau serangan yang menyangkut SARA, fisik (body shaming), gender, atau orientasi seksual.",
      "Membocorkan data pribadi siapa pun (dosen atau mahasiswa), seperti nomor HP, email pribadi, akun media sosial, alamat, foto tanpa izin, atau info keluarga.",
      "Tuduhan pelanggaran hukum (misalnya pelecehan, korupsi, kekerasan) tanpa bukti jelas atau tanpa menempuh jalur laporan resmi. Kalau kamu merasa jadi korban, utamakan lapor ke kampus atau aparat berwenang.",
      "Konten yang berpotensi melanggar KUHP atau UU ITE, seperti fitnah, pencemaran nama baik, doxxing, pornografi, ancaman kekerasan, atau penyebaran hoaks.",
      "Spam, promosi, link komersial, ajakan untuk menyerang seseorang (cyber-bullying), atau mengajak berdebat di luar konteks pengalaman kuliah.",
    ],
  },
  {
    title: "Flag & moderasi",
    items: [
      "Kalau menemukan review yang menurutmu melanggar panduan atau hukum, gunakan tombol laporkan/flag. Moderator akan meninjau dan mengambil tindakan yang perlu.",
      "Review tidak dihapus hanya karena bernada kritis atau memberi nilai rendah. Yang dihapus adalah konten yang melanggar panduan, hukum, atau kebijakan privasi.",
      "Moderator berhak menyunting bagian tertentu dari review (misalnya menghapus data pribadi atau kata yang terlalu kasar) tanpa mengubah makna utama, agar tetap aman dan bermanfaat.",
    ],
  },
  {
    title: "Catatan hukum",
    items: [
      "Konten review dibuat dan dipublikasikan oleh pengguna. Penulis bertanggung jawab penuh atas isi yang mereka unggah.",
      "Sebagai penyedia platform, kami menjalankan moderasi dan menindaklanjuti laporan sesuai hukum Indonesia yang berlaku (misalnya KUHP, UU ITE, dan aturan perlindungan data). Kami dapat menghapus atau membatasi akses ke konten yang dilaporkan atau diminta oleh otoritas yang berwenang.",
      "Aturan lebih rinci tentang hak dan kewajiban pengguna, batasan tanggung jawab platform, serta pengelolaan data pribadi dijelaskan di Syarat Penggunaan dan Kebijakan Privasi. Bacalah dokumen tersebut sebelum memakai layanan.",
    ],
  },
];

const legalParagraphs = [
  "Kami dapat memproses dan, bila perlu, membagikan data tertentu kepada pihak kampus atau penegak hukum yang berwenang jika terdapat laporan ancaman kekerasan, keselamatan, atau permintaan resmi yang sah sesuai hukum Indonesia.",
  "Jika kamu ingin menempuh jalur hukum terkait konten di platform ini, pastikan mengikuti prosedur pemanggilan yang sah di Indonesia dan konsultasikan dulu dengan penasihat hukum kamu.",
  "Dosen atau pihak kampus yang merasa dirugikan dapat mengajukan permintaan klarifikasi atau penghapusan konten dengan menyertakan tautan ke review terkait.",
];

const contactParagraph =
  "Punya pertanyaan moderasi? Laporkan review lewat tombol laporan di halaman dosen. Untuk permintaan lain, hubungi tim admin via support@ratedosen.local.";

const legalDisclaimer =
  "Panduan ini bersifat informatif dan tidak merupakan nasihat hukum. Jika kamu butuh kepastian hukum, silakan konsultasi dengan penasihat hukum atau pihak berwenang. Dengan memakai situs ini, kamu setuju pada Syarat Penggunaan & Kebijakan Privasi yang berlaku; jika terjadi perbedaan, Syarat Penggunaan & Kebijakan Privasi yang menjadi rujukan utama.";

const baseSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://rate-dosen.vercel.app";

const docUrl = `${baseSiteUrl}/panduan`;
const sourceUrl =
  "https://github.com/myudak/rate_dosen/blob/main/app/panduan/page.tsx";

const sectionMarkdown = sections
  .map((section) => {
    const list = section.items.map((item) => `- ${item}`).join("\n");
    return `## ${section.title}\n\n${list}`;
  })
  .join("\n\n");

const markdownContent = [
  "# Panduan Review & Hak Pengguna",
  `> ${heroDescription}`,
  sectionMarkdown,
  "## Proses hukum & kontak",
  ...legalParagraphs,
  contactParagraph,
  "---",
  legalDisclaimer,
].join("\n\n");

export default function PanduanPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <DocActionBar
        markdown={markdownContent}
        docUrl={docUrl}
        sourceUrl={sourceUrl}
      />
      <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/3 ">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Panduan Review & Hak Pengguna
            </h1>
            <p className="text-sm text-muted-foreground">{heroDescription}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-border/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-foreground">
          Proses hukum & kontak
        </h2>
        {legalParagraphs.map((paragraph) => (
          <p key={paragraph} className="mt-2 text-sm text-muted-foreground">
            {paragraph}
          </p>
        ))}
        <p className="mt-3 text-sm text-muted-foreground">
          Punya pertanyaan moderasi? Laporkan review lewat tombol laporan di
          halaman dosen. Untuk permintaan lain, hubungi tim admin via{" "}
          <Link
            href="mailto:support@ratedosen.local"
            className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-300"
          >
            support@ratedosen.local
          </Link>
          .
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 p-4 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/3">
        {legalDisclaimer}
      </div>
    </main>
  );
}
