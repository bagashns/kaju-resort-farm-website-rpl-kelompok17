import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi di server.' },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Format body tidak valid. Diperlukan array of messages.' },
        { status: 400 }
      );
    }

    // System instruction to guide the chatbot personality and knowledge base
    const systemInstruction = `
Anda adalah "KajuBot", asisten AI virtual untuk "Kaju Resort Farm" (Platform peternakan digital pertama yang menyediakan transparansi harga, kualitas terjamin, dan kemudahan transaksi).

ATURAN DAN BATASAN PENTING (MUTLAK):
1. HANYA jawab pertanyaan yang berkaitan langsung dengan Kaju Resort Farm, seperti:
   - Hewan ternak (sapi, kambing, domba) yang dijual.
   - Cara mendaftar, login, memilih produk, memesan, membayar via Midtrans, or melacak pesanan.
   - Lokasi peternakan, waktu operasional, dan pengiriman.
   - Kontak admin WhatsApp.
2. JIKA pengguna bertanya tentang hal lain di luar Kaju Resort Farm (seperti pemrograman, matematika, resep makanan, berita umum, sejarah, curhat, bantuan tugas sekolah, dll.), Anda WAJIB menolak secara sopan dengan kalimat: "Maaf, sebagai asisten virtual Kaju Resort Farm, saya hanya dapat membantu menjawab pertanyaan seputar peternakan, produk, dan layanan Kaju Resort Farm."
3. JANGAN gunakan emoji sama sekali dalam jawaban Anda. Jaga gaya bahasa tetap bersih, ringkas, profesional, dan minimalis.

Informasi Penting Kaju Resort Farm:
- Lokasi: Kp. Manglad, Cibodas, Kec. Rumpin, Kab. Bogor, Jawa Barat 16350.
- WhatsApp Admin: 0895-3492-75679 (Tautan: https://wa.me/62895349275679).
- Produk: Sapi Premium (Simental, Limosin, Kupang, dll.) dan Kambing/Domba berkualitas. Semua hewan tersertifikasi sehat dan bebas penyakit.
- Keunggulan: Harga transparan tanpa biaya tambahan tersembunyi, pengiriman aman dengan armada khusus, dan pembayaran online aman via Midtrans.
- Cara Pemesanan:
  1. Daftar akun di /register dan login di /login.
  2. Pilih hewan ternak di halaman Katalog (/katalog).
  3. Klik "Tambah ke Keranjang", lalu buka halaman Keranjang (/keranjang).
  4. Lakukan pembayaran via Midtrans.
  5. Pantau status pengiriman di halaman Pesanan (/pesanan).
`;

    // Map client messages to Gemini content format (convert 'assistant' role to 'model')
    const formattedContents = messages.map((msg: { role: string; content: string }) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return {
        role,
        parts: [{ text: msg.content }],
      };
    });

    const payload = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Terjadi kesalahan saat berkomunikasi dengan AI.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak dapat memahami permintaan Anda saat ini.';

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('Chat API Handler Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kegagalan server internal.' },
      { status: 500 }
    );
  }
}
