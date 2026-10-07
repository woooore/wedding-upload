'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WeddingUploadPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return alert('사진이나 영상을 선택해주세요.');
    if (!phone) return alert('상품 전달을 위해 연락처를 입력해주세요.');

    setIsUploading(true);
    try {
      const total = files.length;
      for (let i = 0; i < total; i++) {
        setUploadProgress(`업로드 중 (${i + 1}/${total})...`);
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        // 1. Supabase Storage에 파일 업로드
        const { error: uploadError } = await supabase.storage
          .from('wedding-media')
          .upload(cleanName, file);

        if (uploadError) throw uploadError;

        // 2. 파일의 Public URL 가져오기
        const { data: publicUrlData } = supabase.storage
          .from('wedding-media')
          .getPublicUrl(cleanName);

        // 3. submissions 테이블에 하객 정보와 파일 URL 기록
        const { error: dbError } = await supabase.from('submissions').insert({
          uploader_name: name || '익명',
          phone_number: phone,
          file_url: publicUrlData.publicUrl,
        });

        if (dbError) throw dbError;
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert(`업로드 중 오류가 발생했습니다: ${err.message || '다시 시도해주세요.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-amber-50/40 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-amber-100 max-w-sm w-full space-y-4">
          <div className="text-4xl">📸✨</div>
          <h1 className="text-xl font-bold text-gray-800">업로드가 완료되었습니다!</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            저희의 특별한 날을 멋지게 담아주셔서 진심으로 감사드립니다.<br /><br />
            베스트 샷으로 선정되신 분께는 남겨주신 연락처로 선물을 보내드릴게요! 🎁
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setFiles(null);
            }}
            className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl transition text-sm shadow"
          >
            사진 더 올리기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-amber-50/40 font-sans">
      <form onSubmit={handleUpload} className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-amber-100 max-w-sm w-full space-y-5">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Wedding Photo Event</span>
          <h1 className="text-xl font-bold text-gray-900">오늘 찍은 사진을 남겨주세요</h1>
          <p className="text-xs text-gray-500">
            신랑 신부의 순간을 담아주시면 추첨을 통해 선물을 보내드립니다!
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">이름</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">연락처 (선물 수령용)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="예: 010-1234-5678"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">사진 및 영상 선택</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
            />
            {files && files.length > 0 && (
              <p className="text-[11px] text-amber-600 mt-1">총 {files.length}개의 파일 선택됨</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition duration-150 text-sm shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? (uploadProgress || '업로드 중...') : '소중한 순간 전달하기 💌'}
        </button>
      </form>
    </main>
  );
}