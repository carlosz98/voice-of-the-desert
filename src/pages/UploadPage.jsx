import { useEffect } from "react";
import { useLang } from "../lib/i18n.jsx";
import Upload from "../components/Upload.jsx";

/* /subir: the upload form on its own page (same section as on the home page). */
export default function UploadPage() {
  const { t } = useLang();
  useEffect(() => {
    document.title = `${t("Upload")} · ${t("Voice of the Desert")}`;
  }, [t]);
  return (
    <div className="bg-sand pt-[60px]">
      <Upload pageTitle />
    </div>
  );
}
