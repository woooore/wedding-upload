'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrwqytqwzikfeunkjdnl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_B9OE7c4fz3viEKuNSbgQpg_rCOKxDly';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔒 관리자 접속 비밀번호
const ADMIN_PASSWORD = '1234';

interface Submission {
  id: number;
  uploader_name: string;
  phone_number: string;
  file_url: string;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // 데이터 불러오기 함수
  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchSubmissions();
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setPassword('');
    }
  };

  // 파일 강제 다운로드 함수
  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('다운로드 오류:', error);
      window.open(url, '_blank');
    }
  };

  // 사진 삭제 함수 (Storage 원본 + DB 동시 삭제)
  const handleDelete = async (item: Submission) => {
    const isConfirm = window.confirm(`[${item.uploader_name}] 님이 올린 사진을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`);
    if (!isConfirm) return;

    try {
      // 1. Storage에서 파일명 추출 후 삭제
      const fileName = item.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('wedding-media').remove([fileName]);
      }

      // 2. DB submissions 테이블에서 삭제
      const { error: dbError } = await supabase
        .from('submissions')
        .delete()
        .eq('id', item.id);

      if (dbError) throw dbError;

      // 3. 화면 목록에서 바로 제거
      setSubmissions((prev) => prev.filter((sub) => sub.id !== item.id));
      alert('성공적으로 삭제되었습니다.');
    } catch (err: any) {
      console.error(err);
      alert(`삭제 중 오류가 발생했습니다: ${err.message || '다시 시도해주세요.'}`);
    }
  };

  // 로그인 전 화면
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-sm border max-w-xs w-full space-y-4 text-center">
          <div className="text-3xl">🔐</div>
          <h1 className="text-lg font-bold text-gray-800">관리자 전용 로그인</h1>
          <p className="text-xs text-gray-500">신랑 & 신부 전용 확인 페이지입니다.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full border rounded-xl p-3 text-center text-sm outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl transition text-sm"
          >
            접속하기
          </button>
        </form>
      </main>
    );
  }

  // 로그인 후 관리자 갤러리 화면
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 상단 헤더 */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-base font-bold text-gray-900">💍 하객 사진 모음함</h1>
            <p className="text-xs text-gray-500">총 {submissions.length}개의 사진/영상</p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-2 rounded-xl active:bg-amber-100"
          >
            새로고침 🔄
          </button>
        </header>

        {loading ? (
          <div className="text-center py-20 text-xs text-gray-400">사진 목록을 불러오는 중...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-sm text-gray-400 bg-white rounded-2xl border">
            아직 업로드된 사진이 없습니다.
          </div>
        ) : (
          /* 사진 그리드 갤러리 */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {submissions.map((item) => {
              const isVideo = item.file_url.match(/\.(mp4|mov|webm)$/i);

              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col justify-between">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {isVideo ? (
                      <video src={item.file_url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={item.file_url}
                        alt={item.uploader_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-3 text-xs space-y-1">
                    <p className="font-bold text-gray-900 truncate">
                      {item.uploader_name}
                    </p>
                    <a
                      href={`tel:${item.phone_number}`}
                      className="text-amber-600 font-medium block truncate"
                    >
                      📞 {item.phone_number}
                    </a>
                    <p className="text-[10px] text-gray-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    <div className="pt-2 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const ext = item.file_url.split('.').pop() || 'jpg';
                          handleDownload(item.file_url, `${item.uploader_name}_${item.id}.${ext}`);
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-[11px] font-medium transition"
                      >
                        원본 다운로드 ⬇️
                      </button>

                      {/* 🗑️ 삭제 버튼 */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 rounded-lg text-[11px] font-medium transition"
                      >
                        삭제 🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}