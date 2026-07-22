import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ShareModal.css';
import {
  FaWhatsapp,
  FaFacebook,
} from "react-icons/fa";
import {
  Download,
  FolderPlus,
  Users,
  ChevronRight,
} from "lucide-react";

const OPTIONS = [
  {
    name: "WhatsApp",
    icon: <FaWhatsapp size={20} />,
  },
  {
    name: "Facebook",
    icon: <FaFacebook size={20} />,
  },
  {
    name: "Download",
    icon: <Download size={20} />,
  },
  {
    name: "Save to My Studio",
    disabled: true,
    icon: <FolderPlus size={20} />,
  },
  {
    name: "Share with Team",
    disabled: true,
    icon: <Users size={20} />,
  },
];

export default function ShareModal(props) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [sharing, setSharing] = useState(false);
  const fileUrl = state?.file_url || props.shareUrl || window.location.href;
  const shareUrl = state?.id
    ? `${import.meta.env.VITE_SERVER_BASE_URL}/share/template/${state.id}`
    : fileUrl;
  const shareText = props.shareText || state?.title || "Check this out!";

  const [preparedFile, setPreparedFile] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled) return;
        const isVideo = blob.type.startsWith('video') || /\.(mp4|mov)$/i.test(fileUrl);
        const fileName = fileUrl.split('/').pop() || (isVideo ? 'video.mp4' : 'image.jpg');
        setPreparedFile(new File([blob], fileName, {
          type: blob.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        }));
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [fileUrl]);
  const SHARE_LINKS = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  // Fetches the actual video/image and hands it to the OS share-sheet
  // (WhatsApp Status, Instagram, etc. then receive the real file, not a link)
  const shareFileNatively = async () => {
    if (!preparedFile) return false;
    setSharing(true);
    try {
      if (navigator.canShare && navigator.canShare({ files: [preparedFile] })) {
        await navigator.share({ files: [preparedFile], title: shareText, text: shareText });
        return true;
      }
    } catch (err) {
      if (err?.name === 'AbortError') return true;
    } finally {
      setSharing(false);
    }
    return false;
  };

  const handleOption = async (name, disabled) => {
    if (disabled || sharing) return;

    if (name === "WhatsApp") {
      const canNativeShare = typeof navigator.share === 'function';
      const waTab = canNativeShare ? null : window.open("", "_blank");
      const shared = await shareFileNatively();
      if (!shared) {
        if (waTab) waTab.location.href = SHARE_LINKS.whatsapp;
        else window.open(SHARE_LINKS.whatsapp, "_blank", "noopener,noreferrer");
      }
    } else if (name === "Facebook") {
      window.open(SHARE_LINKS.facebook, "_blank", "noopener,noreferrer");
    } else if (name === "Download") {
      fetch(fileUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileUrl.split("/").pop() || "download";
          a.click();
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => alert("Download failed, try again."));
    }
  };

  return (
    <div className="sharemodal">
      <div className="sharemodal__header">
        <button className="sharemodal__back" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h1 className="sharemodal__title">Share Options</h1>
        <span style={{ width: 36 }} />
      </div>

      <p className="sharemodal__label">Quick Share</p>
      <div className="sharemodal__list">
        {OPTIONS.map((item) => (
          <button
            className={`sharemodal__list-item ${item.disabled ? 'sharemodal__list-item--disabled' : ''}`}
            key={item.name}
            onClick={() => handleOption(item.name, item.disabled)}
            disabled={item.disabled || sharing}
            title={item.disabled ? 'Coming soon' : undefined}
          >
            <span className={`sharemodal__list-icon icon-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
              {item.icon}
            </span>

            <span className="sharemodal__list-text">
              {item.name === "WhatsApp" && (sharing || !preparedFile) ? "Preparing video…" : item.name}
            </span>

            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}