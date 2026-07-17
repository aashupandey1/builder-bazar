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
  const shareUrl = props.shareUrl || state?.file_url || window.location.href;
  const shareText = props.shareText || state?.title || "Check this out!";

  const SHARE_LINKS = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  const handleOption = (name, disabled) => {
    if (disabled) return;
    if (name === "WhatsApp" || name === "Facebook") {
      window.open(SHARE_LINKS[name.toLowerCase()], "_blank", "noopener,noreferrer");
    } else if (name === "Download") {
      fetch(shareUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = shareUrl.split("/").pop() || "download";
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
            disabled={item.disabled}
            title={item.disabled ? 'Coming soon' : undefined}
          >
            <span className={`sharemodal__list-icon icon-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
              {item.icon}
            </span>

            <span className="sharemodal__list-text">
              {item.name}
            </span>

            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}