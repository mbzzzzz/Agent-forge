import React, { useState } from 'react';
import { Download, DownloadCloud, Loader2 } from 'lucide-react';
import Button from './Button';
import { useToastContext } from '../../contexts/ToastContext';

interface CarouselDownloadProps {
  slides: { image: string; caption: string }[];
  brandName?: string;
  campaignTitle?: string;
}

const CarouselDownload: React.FC<CarouselDownloadProps> = ({ slides, brandName, campaignTitle }) => {
  const { showToast } = useToastContext();
  const [downloading, setDownloading] = useState<'single' | 'all' | null>(null);

  const downloadImage = (imageBase64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    setDownloading('all');
    try {
      // Dynamic import of JSZip
      let JSZip;
      try {
        JSZip = (await import('jszip')).default;
      } catch (importError) {
        console.error('JSZip not available, downloading individually:', importError);
        // Fallback: download individually
        slides.forEach((slide, index) => {
          if (slide.image) {
            setTimeout(() => {
              downloadImage(slide.image, `${brandName || 'carousel'}-slide-${index + 1}.png`);
            }, index * 200);
          }
        });
        showToast('Downloading images individually...', 'info');
        setDownloading(null);
        return;
      }
      
      const zip = new JSZip();

      // Add all images to zip
      slides.forEach((slide, index) => {
        if (slide.image) {
          const base64Data = slide.image.replace(/^data:image\/\w+;base64,/, '');
          const filename = `${brandName || 'carousel'}-slide-${index + 1}.png`;
          zip.file(filename, base64Data, { base64: true });
        }
      });

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${brandName || 'carousel'}-instagram-carousel.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Carousel downloaded as ZIP!', 'success');
    } catch (error) {
      console.error('Error creating ZIP:', error);
      showToast('Failed to create ZIP. Downloading images individually...', 'error');
      // Fallback: download individually
      slides.forEach((slide, index) => {
        if (slide.image) {
          setTimeout(() => {
            downloadImage(slide.image, `${brandName || 'carousel'}-slide-${index + 1}.png`);
          }, index * 200);
        }
      });
    } finally {
      setDownloading(null);
    }
  };

  const downloadSingle = (imageBase64: string, index: number) => {
    setDownloading('single');
    const filename = `${brandName || 'carousel'}-slide-${index + 1}.png`;
    downloadImage(imageBase64, filename);
    showToast(`Slide ${index + 1} downloaded!`, 'success');
    setTimeout(() => setDownloading(null), 500);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-on-surface">Download Options</span>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          onClick={downloadAllAsZip}
          isLoading={downloading === 'all'}
          disabled={downloading !== null}
          className="flex-1 min-w-[140px]"
        >
          {downloading === 'all' ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Creating ZIP...
            </>
          ) : (
            <>
              <DownloadCloud className="w-3 h-3 mr-1" />
              Download All (ZIP)
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => downloadSingle(slide.image, index)}
            disabled={downloading !== null || !slide.image}
            className="relative group p-2 rounded-lg bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Download slide ${index + 1}`}
          >
            {slide.image ? (
              <>
                <img
                  src={`data:image/png;base64,${slide.image}`}
                  alt={`Slide ${index + 1}`}
                  className="w-full aspect-square object-cover rounded mb-1"
                />
                <div className="flex items-center justify-center">
                  <Download className="w-3 h-3 text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
              </>
            ) : (
              <div className="w-full aspect-square bg-white/10 rounded flex items-center justify-center">
                <span className="text-xs text-on-surface-variant/50">N/A</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CarouselDownload;

