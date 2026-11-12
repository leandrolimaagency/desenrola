"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FirstStageButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;

    const timeout = window.setTimeout(() => router.push("/consulta"), 2000);
    return () => window.clearTimeout(timeout);
  }, [loading, router]);

  if (loading) {
    return (
      <div className="offers-loading-page" role="status" aria-live="polite">
        <div className="offers-loading-content">
          <Image
            className="offers-loading-attendant"
            src="/assets/offers-attendant.png"
            alt=""
            width={374}
            height={328}
            priority
          />
          <div className="offers-loading-card">
            <div className="offers-progress-track" aria-hidden="true">
              <span className="offers-progress-fill" />
            </div>
            <p>redirecionando com segurança...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className="offers-button"
      type="button"
      onClick={() => setLoading(true)}
    >
      Realizar Consulta Agora
    </button>
  );
}
