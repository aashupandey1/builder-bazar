import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { prepareFile } from '../../../utils/preparedFileCache';
import './ShareModal.css';
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";
import {
  Download,
  ChevronRight,
} from "lucide-react";

const OPTIONS = [
  {
    name: "WhatsApp",
    icon: <FaWhatsapp size={20} />,
  },
  {
    name: "Instagram",
    icon: <FaInstagram size={20} />,
  },
  {
    name: "Facebook",
    icon: <FaFacebook size={20} />,
  },
  {
    name: "Download",
    icon: <Download size={20} />,
  },
];

export default function ShareModal(props) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [sharing, setSharing] = useState(null); // name of the option currently sharing, or null
  const fileUrl = state?.file_url || props.shareUrl || window.location.href;
  const shareUrl = state?.id
    ? `${import.meta.env.VITE_SERVER_BASE_URL}/share/template/${state.id}`
    : fileUrl;
  const shareText = props.shareText || state?.title || "Check this out!";

  const [preparedFile, setPreparedFile] = useState(null);
  const [preparing, setPreparing] = useState(true); // true till file fetch finishes (success or fail)
  useEffect(() => {
    let cancelled = false;
    setPreparing(true);
    prepareFile(fileUrl)
      .then((file) => { if (!cancelled) setPreparedFile(file); })
      .finally(() => { if (!cancelled) setPreparing(false); });
    return () => { cancelled = true; };
  }, [fileUrl]);


  // Fetches the actual video/image and hands it to the OS share-sheet
  // (WhatsApp Status, Instagram, etc. then receive the real file, not a link)
  const shareFileNatively = async (name) => {
    setSharing(name);
    try {
      // retry fetch here too — file may not have been ready when the modal first mounted
      const file = preparedFile || (await prepareFile(fileUrl));
      if (!file) {
        console.warn('[ShareModal] prepareFile resolved null — fetch likely failed or fileUrl is empty');
        return false;
      }
      if (!navigator.canShare) {
        console.warn('[ShareModal] navigator.canShare not available (non-HTTPS or unsupported browser)');
        return false;
      }
      if (!navigator.canShare({ files: [file] })) {
        console.warn('[ShareModal] canShare({ files }) returned false — file MIME:', file.type, 'name:', file.name);
        return false;
      }
      await navigator.share({ files: [file], title: shareText, text: shareText });
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') return true; // user cancelled the share sheet — that's fine
      console.warn('[ShareModal] navigator.share threw:', err?.name, err?.message);
    } finally {
      setSharing(null);
    }
    return false;
  };

  const handleOption = async (name, disabled) => {
    if (disabled || sharing) return;

    if (name === "WhatsApp" || name === "Instagram" || name === "Facebook") {
      const shared = await shareFileNatively(name);
      if (!shared) alert("Sharing isn't supported on this browser — try opening this page on your phone.");
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
            disabled={item.disabled || sharing || (preparing && item.name !== "Download")}
            title={item.disabled ? 'Coming soon' : undefined}
          >
            <span className={`sharemodal__list-icon icon-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
              {item.icon}
            </span>

            <span className="sharemodal__list-text">
              {sharing === item.name
                ? "Preparing video…"
                : (preparing && item.name !== "Download")
                  ? "Preparing…"
                  : item.name}
            </span>

            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}