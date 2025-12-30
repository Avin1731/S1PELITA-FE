import SintaFullLogo from '@/components/SintaFullLogo';
import RoleSelectionCard from '@/components/RoleSelectionCard';

export default function Home() {
  // Definisikan data tombol peran
  const buttons = [
    // 1. ADMIN -> Login dengan mode Admin
    { name: 'Admin', href: '/login?as=admin' }, 
    
    // 2. PUSDATIN -> Login dengan mode Pusdatin
    { name: 'Pusdatin', href: '/login?as=pusdatin' }, 
    
    // 3. DLH -> Langsung ke Login (Skip halaman pilih jenis DLH)
    // Di halaman login user bisa memilih tombol "Daftar Provinsi" atau "Kab/Kota"
    { name: 'Dinas Lingkungan Hidup', href: '/login' }, 
  ];

  return (
    // Latar belakang grid dan layout dipertahankan
    <main 
      className="flex flex-col items-center justify-center min-h-screen py-12 px-4 space-y-8" 
      style={{
        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      
      {/* Logo di luar card */}
      <div className="flex justify-center">
        <SintaFullLogo />
      </div>

      {/* Panggil komponen Card Reusable */}
      <RoleSelectionCard
        title="Selamat datang di SIPELITA"
        subtitle="Silahkan pilih peran Anda terlebih dahulu"
        // Kirim list tombol yang sudah diperbarui URL-nya
        buttons={buttons.map(btn => ({ text: btn.name, href: btn.href }))} 
      />
    </main>
  );
}