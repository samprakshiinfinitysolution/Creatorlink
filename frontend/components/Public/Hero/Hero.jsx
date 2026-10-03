import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-background
        px-[18px]
        pt-[168px]
        pb-8
        text-foreground

        sm:px-6
        sm:pt-[175px]

        md:px-8
        md:pt-[180px]

        lg:px-8
        lg:pt-[175px]
        lg:pb-12
      "
    >
      <style>{`
        .hero-influence {
          position: relative;
          display: inline-block;

          background: linear-gradient(110deg,
              #ff4f87 0%,
              #ff4f87 35%,
              #ffb3cb 50%,
              #ff4f87 65%,
              #ff4f87 100%);

          background-size: 220% 100%;
          background-position: 100% 0;

          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;

          animation: influenceShimmer 3.2s ease-in-out infinite;
        }

        @keyframes influenceShimmer {
          0% {
            background-position: 120% 0;
          }

          45% {
            background-position: 0% 0;
          }

          100% {
            background-position: -120% 0;
          }
        }
      `}</style>
      {/* ================= ANIMATED BACKGROUND ================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[180px]
          h-[420px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-secondary/[0.07]
          blur-[100px]
          animate-heroGlow
          dark:bg-secondary/[0.06]
        "
      />

      {/* ================= LOCATION ================= */}

      <div className="flex justify-start lg:justify-center">
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-secondary/20
            bg-background
            px-3.5
            py-2
            text-[10px]
            font-medium
            tracking-[0.08em]
            text-secondary-dark

            sm:px-4
            sm:text-[11px]

            dark:border-secondary/30
            dark:bg-surface
            dark:text-secondary
          "
        >
          <span className="h-2 w-2 rounded-full bg-secondary" />

          PARIS • MILAN • TOKYO • NY
        </div>
      </div>

      {/* ================= HEADING ================= */}

      <div
        className="
          mt-6
          w-full
          text-left

          sm:mt-7

          lg:mx-auto
          lg:max-w-[1100px]
          lg:text-center
        "
      >
        <h1
          className="
            whitespace-nowrap
            text-[40px]
            leading-[0.98]
            tracking-[-0.045em]
            text-foreground

            sm:text-[50px]
            md:text-[62px]
            lg:text-[78px]
            xl:text-[82px]
          "
          style={{
            fontFamily: "var(--font-playfair), serif",
          }}
        >
          Where Brands Meet
        </h1>

        <h2
          className="
            hero-influence
            mt-1
            text-[40px]
            leading-[0.95]
            tracking-[-0.045em]
            text-secondary

            sm:text-[50px]
            md:text-[62px]
            lg:text-[78px]
            xl:text-[82px]
          "
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontStyle: "italic",
          }}
        >
          Influence.
        </h2>

        {/* ================= DESCRIPTION ================= */}

        <p
          className="
            mt-5
            max-w-[390px]
            text-[17px]
            leading-[1.7]
            text-text-secondary

            sm:max-w-[600px]
            sm:text-[18px]

            md:max-w-[720px]
            md:text-[19px]

            lg:mx-auto
            lg:mt-7
            lg:max-w-[850px]
            lg:text-[20px]

            xl:text-[21px]
          "
        >
          Discover hand-vetted tastemakers. Architect cinematic campaigns.
          Create high-conversion cultural moments.
          <span className="hidden lg:inline">
            {" "}
            Create high-conversion cultural moments that audiences remember.
          </span>
        </p>
      </div>

      {/* ================= BUTTONS ================= */}

      <div
        className="
          mt-7
          flex
          w-full
          flex-col
          gap-3

          sm:mt-8

          lg:mx-auto
          lg:max-w-[560px]
          lg:flex-row
        "
      >
        {/* FIND CREATOR */}

        <Link
          href="/creators"
          className="
    flex
    h-[64px]
    w-full
    items-center
    justify-center
    gap-3
    rounded-full
    bg-primary
    text-[16px]
    font-medium
    text-white
    transition-all
    duration-200
    hover:scale-[1.02]
    hover:bg-theme-hover

    lg:flex-1

    dark:bg-primary
    dark:text-black
    dark:hover:bg-theme-hover
  "
        >
          Find Your Creator
          <span className="text-[22px]">→</span>
        </Link>

        {/* JOIN CREATOR */}

        <Link
          href="/signup"
          className="
            flex
            h-[60px]
            w-full
            items-center
            justify-center
            rounded-full
            border
            border-border-theme
            bg-surface
            text-[16px]
            font-medium
            text-primary
            transition-all
            duration-200
            hover:-translate-y-1

            lg:h-[64px]
            lg:flex-1

            dark:bg-surface
            dark:text-primary
          "
        >
          Join as Creator
        </Link>
      </div>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <div className="mx-auto mt-7 w-full max-w-[850px] sm:mt-8 lg:mt-10">

        {/* ===================================================
            MOBILE + TABLET FEATURES
            =================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-2.5

            lg:hidden
          "
        >
          {/* ================= ESCROW VAULT ================= */}

          <div
            className="
              flex
              min-h-[58px]
              items-center
              gap-2
              rounded-[15px]
              border
              border-border-theme
              bg-surface/50
              px-3
              py-2.5

              sm:min-h-[64px]
              sm:px-4
            "
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-secondary"
            >
              <path d="M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <div className="min-w-0">
              <p className="text-[10px] font-bold text-primary sm:text-[11px]">
                ESCROW VAULT
              </p>

              <p className="mt-0.5 whitespace-nowrap text-[10px] text-text-secondary sm:text-[11px]">
                100% Funds Secured
              </p>
            </div>
          </div>

          {/* ================= RAPID BOOKING ================= */}

          <div
            className="
              flex
              min-h-[58px]
              items-center
              gap-2
              rounded-[15px]
              border
              border-border-theme
              bg-surface/50
              px-3
              py-2.5

              sm:min-h-[64px]
              sm:px-4
            "
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-secondary"
            >
              <circle cx="12" cy="12" r="8" />
              <path d="M12 7v5l3 2" />
            </svg>

            <div className="min-w-0">
              <p className="text-[10px] font-bold text-primary sm:text-[11px]">
                RAPID BOOKING
              </p>

              <p className="mt-0.5 whitespace-nowrap text-[10px] text-text-secondary sm:text-[11px]">
                Avg 48h Turnaround
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            DESKTOP FEATURES
            =================================================== */}

        <div
          className="
            hidden
            items-center
            justify-center
            gap-5
            text-[13px]
            text-text-secondary

            lg:flex
            lg:gap-6
            xl:gap-7
          "
        >
          {/* ESCROW PROTECTION */}

          <div className="flex items-center gap-2 whitespace-nowrap">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-secondary"
            >
              <path d="M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <span>Escrow Protection</span>
          </div>

          <span>•</span>

          {/* SMART AGREEMENTS */}

          <div className="flex items-center gap-2 whitespace-nowrap">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-secondary"
            >
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <path d="M9 8h6" />
              <path d="M9 12h6" />
              <path d="M9 16h4" />
            </svg>

            <span>Smart Agreements</span>
          </div>

          <span>•</span>

          {/* 48H TURNAROUND */}

          <div className="flex items-center gap-2 whitespace-nowrap">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-secondary"
            >
              <circle cx="12" cy="12" r="8" />
              <path d="M12 7v5l3 2" />
            </svg>

            <span>48h Turnaround</span>
          </div>
        </div>
      </div>
    </section>
  );
}