import { MessageCircle, Instagram } from 'lucide-react';

export const SocialFloating = () => {
  const whatsappNumber = '919785795669';
  const instagramHandle = 'codeverseinstitute';

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-float-button"
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg transition-all duration-300 hover:scale-110"
        title="WhatsApp par contact karein"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
      
      <a
        href={`https://instagram.com/${instagramHandle}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="instagram-float-button"
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 shadow-lg transition-all duration-300 hover:scale-110"
        title="Instagram par follow karein"
      >
        <Instagram className="w-7 h-7 text-white" />
      </a>
    </div>
  );
};