import React, { useState } from 'react';
import { HeaderConfig, FooterConfig, HeaderBgStyle } from '../types';
import { UserCheck, Quote, Phone, FileText, Sparkles, X, Image as ImageIcon, Palette, Smile, FileSpreadsheet } from 'lucide-react';

interface Props {
  header: HeaderConfig;
  footer: FooterConfig;
  onUpdateHeader: (newHeader: HeaderConfig) => void;
  onUpdateFooter: (newFooter: FooterConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  {
    id: 'chibi_anime',
    name: 'Chibi Cô Giáo Cute',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherHieuChibi&hair=long01,curly&hairColor=2c1b18',
  },
  {
    id: 'chibi_cute_2',
    name: 'Chibi Vui Nhộn',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherHieuChibiPink',
  },
  {
    id: 'short_wavy',
    name: 'Chân Dung Giáo Viên 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'youthful_friendly',
    name: 'Chân Dung Giáo Viên 2',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  },
];

export const HeaderFooterEditor: React.FC<Props> = ({
  header,
  footer,
  onUpdateHeader,
  onUpdateFooter,
  isOpen,
  onClose,
}) => {
  const [localHeader, setLocalHeader] = useState<HeaderConfig>(header);
  const [localFooter, setLocalFooter] = useState<FooterConfig>(footer);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateHeader(localHeader);
    onUpdateFooter(localFooter);
    onClose();
  };

  const handleResetTeacherDefaults = () => {
    setLocalHeader({
      ...localHeader,
      schoolName: 'TRƯỜNG THPT CHÂU THÀNH A',
      departmentName: 'TỔ TOÁN - TIN HỌC',
      quote: 'CÓ HỌC MỚI THÀNH TÀI – MIỆT MÀI MỚI THÀNH GIỎI',
      teacherAvatarPreset: 'chibi_anime',
      teacherAvatarUrl: AVATAR_PRESETS[0].url,
      logoType: 'math',
      bgStyle: 'pedagogical_topbar',
      showOpticalMarkSheet: true,
      examCode: '101',
    });
    setLocalFooter({
      teacherName: 'Ths Lê Thị Hiếu',
      tagline: 'Tư duy có phương pháp. Thành công có lời giải.',
      contactPhone: '0939069119',
      contactZalo: 'zalo: 0939069119',
      showPageNumbers: true,
      bgStyle: 'banner',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-600 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-amber-300" />
            <div>
              <h2 className="text-lg font-bold">Cấu hình Nhận diện Thương hiệu & Header / Footer Sư Phạm</h2>
              <p className="text-xs text-blue-100">Khung viền nhiều màu, Avatar Chibi hoạt hình, Mã đề & Thông tin liên hệ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Preset Button */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 font-medium text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Nạp cấu hình mặc định Giáo viên (Ths Lê Thị Hiếu - TRƯỜNG THPT CHÂU THÀNH A)</span>
            </div>
            <button
              onClick={handleResetTeacherDefaults}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              Nạp thông tin Chibi
            </button>
          </div>

          {/* SECTION A: HEADER CONFIG */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Header (Đầu trang & Nhận diện Đề thi)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Trường / Sở GD&ĐT</label>
                <input
                  type="text"
                  value={localHeader.schoolName}
                  onChange={(e) => setLocalHeader({ ...localHeader, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tổ bộ môn / Khối chuyên đề</label>
                <input
                  type="text"
                  value={localHeader.departmentName || 'TỔ TOÁN - TIN HỌC'}
                  onChange={(e) => setLocalHeader({ ...localHeader, departmentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề Đề thi / Phiếu bài tập</label>
                <input
                  type="text"
                  value={localHeader.examTitle}
                  onChange={(e) => setLocalHeader({ ...localHeader, examTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã đề thi (VD: 101, 102)</label>
                <input
                  type="text"
                  value={localHeader.examCode || '101'}
                  onChange={(e) => setLocalHeader({ ...localHeader, examCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Môn học & Khối lớp</label>
                <input
                  type="text"
                  value={localHeader.subject}
                  onChange={(e) => setLocalHeader({ ...localHeader, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian làm bài</label>
                <input
                  type="text"
                  value={localHeader.duration}
                  onChange={(e) => setLocalHeader({ ...localHeader, duration: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Header Quote & Chibi Avatar Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5 text-amber-600" /> Khẩu hiệu / Danh ngôn sư phạm
                </label>
                <textarea
                  rows={3}
                  value={localHeader.quote}
                  onChange={(e) => setLocalHeader({ ...localHeader, quote: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="CÓ HỌC MỚI THÀNH TÀI – MIỆT MÀI MỚI THÀNH GIỎI"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-amber-500" /> Avatar Giáo viên Chibi Hoạt hình (Header)
                </label>

                {/* Avatar Quick Presets */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setLocalHeader({ ...localHeader, teacherAvatarUrl: p.url })}
                      className={`p-1.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                        localHeader.teacherAvatarUrl === p.url
                          ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-8 h-8 rounded-full bg-white border border-slate-200 p-0.5 object-cover" />
                      <span className="text-[11px] font-semibold text-slate-700 truncate">{p.name}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={localHeader.teacherAvatarUrl}
                  onChange={(e) => setLocalHeader({ ...localHeader, teacherAvatarUrl: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="URL ảnh Chibi hoặc Chân dung tùy chỉnh..."
                />
              </div>
            </div>

            {/* Checkboxes for Student Info and Optical Mark Sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showStudentInfoBox"
                  checked={localHeader.showStudentInfoBox}
                  onChange={(e) => setLocalHeader({ ...localHeader, showStudentInfoBox: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500"
                />
                <label htmlFor="showStudentInfoBox" className="text-xs text-slate-700 font-medium">
                  Hiển thị khung thông tin học sinh (Họ tên, SBD, Lớp)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOpticalMarkSheet"
                  checked={localHeader.showOpticalMarkSheet !== false}
                  onChange={(e) => setLocalHeader({ ...localHeader, showOpticalMarkSheet: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500"
                />
                <label htmlFor="showOpticalMarkSheet" className="text-xs text-slate-700 font-medium flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hiển thị Phiếu tô trắc nghiệm (Ⓐ Ⓑ Ⓒ Ⓓ)</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION B: FOOTER CONFIG */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" /> Footer (Chân trang chuyên nghiệp)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên Giáo viên</label>
                <input
                  type="text"
                  value={localFooter.teacherName}
                  onChange={(e) => setLocalFooter({ ...localFooter, teacherName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  placeholder="Ths Lê Thị Hiếu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khẩu hiệu / Slogan cá nhân</label>
                <input
                  type="text"
                  value={localFooter.tagline}
                  onChange={(e) => setLocalFooter({ ...localFooter, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none italic"
                  placeholder="Tư duy có phương pháp. Thành công có lời giải."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại / Zalo</label>
                <input
                  type="text"
                  value={localFooter.contactPhone}
                  onChange={(e) => setLocalFooter({ ...localFooter, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0939069119"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-blue-900 to-amber-600 hover:from-blue-950 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            Lưu thay đổi thương hiệu
          </button>
        </div>
      </div>
    </div>
  );
};
